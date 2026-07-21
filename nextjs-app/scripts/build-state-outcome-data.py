#!/usr/bin/env python3
"""Build state high-school postsecondary outcome datasets.

The site serves the generated JSON statically. This script keeps the live
scraping/parsing step explicit so builds do not depend on external state sites.
"""

from __future__ import annotations

import json
import os
import re
import tempfile
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET


APP_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = APP_DIR / "public" / "data" / "state-outcomes"
CACHE_DIR = Path(
    os.environ.get(
        "STATE_OUTCOME_CACHE",
        Path(tempfile.gettempdir()) / "collegeacceptance-state-outcomes",
    )
)

TX_YEARS = range(2019, 2025)
TX_CAMPUS_URL = (
    "https://reportcenter.highered.texas.gov/reports/data/"
    "high-school-graduates-enrolled-in-higher-education-by-campus-fall-{year}-xls/"
)

XLSX_NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def compact(value: Any) -> str:
    return " ".join(str(value or "").replace("\xa0", " ").strip().split())


def normalized(value: Any) -> str:
    return compact(value).lower()


def clean_tx_name(value: Any) -> str:
    text = compact(value).title()
    replacements = {
        " Isd": " ISD",
        " Cisd": " CISD",
        " H S": " H S",
        " J H": " J H",
        " P-Tech": " P-TECH",
        " Stem": " STEM",
        " Early College": " Early College",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def clean_tx_county(value: Any) -> str:
    text = clean_tx_name(value)
    return re.sub(r"\s+(County|Co)$", "", text)


def canonical_tx_school_key(value: Any) -> str:
    text = normalized(value)
    text = re.sub(r"\bhigh school\b", "h s", text)
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def clean_institution(value: Any) -> str:
    text = re.sub(r"\s+\(\d+\)\s*$", "", compact(value)).title()
    replacements = {
        "A&M": "A&M",
        "Ut ": "UT ",
        "Utpb": "UTPB",
        "Utsa": "UTSA",
        "Univ": "Univ.",
        "Comm College": "Community College",
        "Coll Dist": "College District",
        "Sys Admin": "System Administration",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "unknown"


def parse_number(value: Any) -> int | None:
    text = compact(value)
    if not text or text in {"<", "-", "*"}:
        return None
    text = re.sub(r"[^\d.-]", "", text)
    if not text:
        return None
    try:
        return int(round(float(text)))
    except ValueError:
        return None


def rounded_rate(numerator: int | None, denominator: int | None) -> float | None:
    if numerator is None or denominator is None or denominator <= 0:
        return None
    return round((numerator / denominator) * 100, 1)


def fetch(url: str, destination: Path, form: dict[str, str] | None = None) -> None:
    if destination.exists() and destination.stat().st_size > 0:
        return

    destination.parent.mkdir(parents=True, exist_ok=True)
    data = urllib.parse.urlencode(form).encode("utf-8") if form else None
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "User-Agent": "collegeacceptance.info data builder",
            "Accept": "*/*",
        },
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        destination.write_bytes(response.read())


def column_index(cell_reference: str) -> int:
    letters = "".join(ch for ch in cell_reference if ch.isalpha())
    index = 0
    for letter in letters:
        index = index * 26 + (ord(letter.upper()) - 64)
    return max(index - 1, 0)


def xlsx_rows(path: Path) -> list[list[str]]:
    with zipfile.ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si", XLSX_NS):
                shared_strings.append(
                    "".join(text.text or "" for text in item.findall(".//main:t", XLSX_NS))
                )

        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows: list[list[str]] = []
        for row in sheet.findall(".//main:sheetData/main:row", XLSX_NS):
            values: list[str] = []
            for cell in row.findall("main:c", XLSX_NS):
                idx = column_index(cell.attrib.get("r", "A1"))
                while len(values) <= idx:
                    values.append("")

                cell_type = cell.attrib.get("t")
                raw_value = cell.find("main:v", XLSX_NS)
                if cell_type == "inlineStr":
                    value = "".join(
                        text.text or "" for text in cell.findall(".//main:t", XLSX_NS)
                    )
                elif raw_value is None or raw_value.text is None:
                    value = ""
                elif cell_type == "s":
                    value = shared_strings[int(raw_value.text)]
                else:
                    value = raw_value.text
                values[idx] = compact(value)
            rows.append(values)
    return rows


def is_tx_destination(institution: str) -> bool:
    text = normalized(institution)
    return not (
        text.startswith("not found")
        or text.startswith("not trackable")
        or text.startswith("total high school graduates")
        or text.startswith("other")
    )


def build_texas() -> dict[str, Any]:
    schools: dict[str, dict[str, Any]] = {}

    for year in TX_YEARS:
        path = CACHE_DIR / f"texas-campus-{year}.xlsx"
        fetch(TX_CAMPUS_URL.format(year=year), path)
        rows = xlsx_rows(path)

        try:
            header_index = next(
                index
                for index, row in enumerate(rows)
                if [normalized(cell) for cell in row[:6]]
                == ["county", "district", "name", "code", "institution", "students"]
            )
        except StopIteration as error:
            raise RuntimeError(f"Could not find Texas header row in {path}") from error

        for row in rows[header_index + 1 :]:
            if len(row) < 6:
                continue
            county, district, school_name, code, institution, students_raw = row[:6]
            if not code or not institution:
                continue

            students = parse_number(students_raw)
            if students is None:
                continue

            cleaned_county = clean_tx_county(county)
            school_key = slugify(
                f"{cleaned_county}-{district}-{canonical_tx_school_key(school_name)}"
            )
            school = schools.setdefault(
                school_key,
                {
                    "id": school_key,
                    "schoolName": clean_tx_name(school_name),
                    "district": clean_tx_name(district),
                    "county": cleaned_county,
                    "state": "TX",
                    "campusCodes": [],
                    "years": {},
                },
            )
            if code not in school["campusCodes"]:
                school["campusCodes"].append(code)
            year_data = school["years"].setdefault(
                str(year),
                {
                    "graduates": None,
                    "notFound": 0,
                    "notTrackable": 0,
                    "destinations": defaultdict(int),
                },
            )

            institution_key = normalized(institution)
            if institution_key.startswith("total high school graduates"):
                year_data["graduates"] = students
            elif institution_key.startswith("not found"):
                year_data["notFound"] += students
            elif institution_key.startswith("not trackable"):
                year_data["notTrackable"] += students
            elif is_tx_destination(institution):
                year_data["destinations"][clean_institution(institution)] += students

    for school in schools.values():
        latest_key = None
        for year_key, year_data in list(school["years"].items()):
            graduates = year_data.get("graduates")
            if not graduates:
                del school["years"][year_key]
                continue

            not_found = year_data.get("notFound") or 0
            not_trackable = year_data.get("notTrackable") or 0
            trackable_graduates = max(graduates - not_trackable, 0)
            enrolled = max(graduates - not_found - not_trackable, 0)
            destination_rows = sorted(
                year_data["destinations"].items(),
                key=lambda item: (-item[1], item[0]),
            )[:8]

            year_data["trackableGraduates"] = trackable_graduates
            year_data["enrolled"] = enrolled
            year_data["enrollmentRate"] = rounded_rate(enrolled, trackable_graduates)
            year_data["coverageGap"] = not_found
            year_data["coverageGapRate"] = rounded_rate(not_found, trackable_graduates)
            year_data["topDestinations"] = [
                {"name": name, "students": count} for name, count in destination_rows
            ]
            del year_data["destinations"]
            latest_key = max(latest_key or year_key, year_key)

        school["latestYear"] = latest_key

    schools_list = [school for school in schools.values() if school["years"]]
    latest_year = str(max(TX_YEARS))
    schools_list.sort(
        key=lambda school: (
            -(school["years"].get(latest_year, {}).get("graduates") or 0),
            school["schoolName"],
        )
    )

    return {
        "stateSlug": "texas",
        "stateName": "Texas",
        "abbreviation": "TX",
        "generatedAt": date.today().isoformat(),
        "sourceLabel": "Texas Higher Education Coordinating Board campus files",
        "sourceUrl": "https://www.txhighereddata.org/high-school-graduates/hsgradsenrolled/",
        "sourceNote": (
            "Texas rows merge annual THECB campus-level files for Fall 2019 through "
            "Fall 2024 by high school, district, and county. These are enrollment "
            "outcomes, not applications or admission offers."
        ),
        "years": [{"key": str(year), "label": str(year)} for year in TX_YEARS],
        "rateLabel": "Tracked enrollment rate",
        "coverageGapLabel": "Not found in covered Texas higher-ed records",
        "primaryCountLabel": "Graduates",
        "secondaryCountLabel": "Enrolled",
        "detailTitle": "Top destinations",
        "emptyDetailText": "No destination list is available for the selected year.",
        "schools": schools_list,
    }


def write_dataset(dataset: dict[str, Any]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / f"{dataset['stateSlug']}.json"
    path.write_text(json.dumps(dataset, separators=(",", ":"), ensure_ascii=True), encoding="utf-8")
    school_count = len(dataset["schools"])
    year_count = len(dataset["years"])
    print(f"Wrote {path.relative_to(APP_DIR)} ({school_count:,} schools, {year_count} years)")


def main() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    write_dataset(build_texas())


if __name__ == "__main__":
    main()
