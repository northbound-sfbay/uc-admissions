#!/usr/bin/env python3
"""Build state high-school postsecondary outcome datasets.

The site serves the generated JSON statically. This script keeps the live
scraping/parsing step explicit so builds do not depend on external state sites.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import urllib.parse
import urllib.request
import zipfile
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
TX_GPA_URL = (
    "https://reportcenter.highered.texas.gov/reports/data/"
    "high-school-graduates-gpa-in-higher-education-{start_year}-{end_year}-xls/"
)
TX_UT_AUSTIN_FICE = "003658"

TX_GPA_GROUPS = {
    "four-year public university": "publicFourYear",
    "two-year public colleges": "publicTwoYear",
    "independent colleges & universities": "independent",
}
TX_GPA_BANDS = (
    ("under2", "<2.0"),
    ("from2To249", "2.0-2.49"),
    ("from25To299", "2.5-2.99"),
    ("from3To349", "3.0-3.49"),
    ("over35", ">3.5"),
    ("unknown", "Unknown"),
)

XLSX_NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def compact(value: Any) -> str:
    return " ".join(str(value or "").replace("\xa0", " ").strip().split())


def normalized(value: Any) -> str:
    return compact(value).lower()


def title_with_acronyms(value: Any) -> str:
    """Title-case source labels without substring replacements.

    The source is mostly uppercase and contains abbreviations. Replacing strings
    such as ``Univ`` globally corrupts already-complete words (``Univ.ersity``),
    so all normalization here is token- or phrase-boundary based.
    """

    text = compact(value).title()
    text = re.sub(r"\b([A-Za-z]+)'S\b", lambda match: f"{match.group(1)}'s", text)

    token_replacements = {
        "Isd": "ISD",
        "Cisd": "CISD",
        "Stem": "STEM",
        "Ut": "UT",
        "Utsa": "UTSA",
        "Utpb": "UTPB",
        "Ccd": "CCD",
        "Hsi": "HSI",
    }
    for old, new in token_replacements.items():
        text = re.sub(rf"\b{re.escape(old)}\b", new, text)

    text = re.sub(r"\bP-Tech\b", "P-TECH", text, flags=re.IGNORECASE)
    text = re.sub(r"\bA\s*&\s*M\b", "A&M", text, flags=re.IGNORECASE)
    text = re.sub(r"\b([A-Z])\.\s+([A-Z])\b", r"\1 \2", text)

    small_words = ("And", "At", "For", "In", "Of", "The")
    for word in small_words:
        text = re.sub(rf"(?<!^)\b{word}\b", word.lower(), text)
    return text


def clean_tx_name(value: Any) -> str:
    return title_with_acronyms(value)


def clean_tx_county(value: Any) -> str:
    text = clean_tx_name(value)
    # Older workbooks contain visibly truncated COUNTY suffixes (COUNT/COUN/COU).
    return re.sub(r"\s+(County|Count|Coun|Cou|Co)$", "", text, flags=re.IGNORECASE)


def clean_institution(value: Any) -> str:
    text = compact(value)
    phrase_replacements = (
        (r"\bU\.\s+OF\s+TEXAS\b", "UNIVERSITY OF TEXAS"),
        (r"\bUNIV\b\.?", "UNIVERSITY"),
        (r"\bCOMM\b\.?", "COMMUNITY"),
        (r"\bCOLL\b\.?", "COLLEGE"),
        (r"\bDIST\b\.?", "DISTRICT"),
        (r"\bSYS\b\.?", "SYSTEM"),
        (r"\bADMIN\b\.?", "ADMINISTRATION"),
        (r"\bT\.\s*C\.", "TECHNICAL COLLEGE"),
    )
    for pattern, replacement in phrase_replacements:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    text = title_with_acronyms(text)
    text = re.sub(r"\b([24])-Yr\b", r"\1-year", text, flags=re.IGNORECASE)
    return text


def normalize_tx_campus_code(value: Any) -> str:
    digits = re.sub(r"\D", "", compact(value).split(".", 1)[0])
    return digits.zfill(9) if digits else ""


def parse_tx_destination(value: Any, students: int) -> dict[str, Any]:
    raw = compact(value)
    fice_match = re.search(r"\s+\((\d{6})\)\s*$", raw)
    if fice_match:
        return {
            "name": clean_institution(raw[: fice_match.start()]),
            "ficeCode": fice_match.group(1),
            "students": students,
            "aggregate": False,
        }

    aggregate_match = re.match(
        r"^Other\s+(.+?)\s+Institution\s+\((\d+)\)\s*$",
        raw,
        flags=re.IGNORECASE,
    )
    if aggregate_match:
        return {
            "name": clean_institution(f"Other {aggregate_match.group(1)} institutions"),
            "ficeCode": None,
            "students": students,
            "aggregate": True,
            "institutionCount": int(aggregate_match.group(2)),
        }

    return {
        "name": clean_institution(raw),
        "ficeCode": None,
        "students": students,
        "aggregate": normalized(raw).startswith("other"),
    }


def parse_number(value: Any) -> int | None:
    text = compact(value)
    if not text or text.startswith("<") or text in {"-", "*"}:
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


def workbook_rows(path: Path) -> list[list[str]]:
    if zipfile.is_zipfile(path):
        return xlsx_rows(path)

    converted_path = path.with_name(f"{path.stem}-converted.xlsx")
    if not converted_path.exists():
        soffice = shutil.which("soffice") or shutil.which("libreoffice")
        if not soffice:
            raise RuntimeError(
                f"{path} is a legacy XLS workbook. Install LibreOffice so the data "
                "builder can convert older THECB files to XLSX."
            )
        with tempfile.TemporaryDirectory(prefix="thecb-xls-") as temp_dir_name:
            temp_dir = Path(temp_dir_name)
            legacy_path = temp_dir / f"{path.stem}.xls"
            legacy_path.write_bytes(path.read_bytes())
            subprocess.run(
                [
                    soffice,
                    "--headless",
                    "--convert-to",
                    "xlsx",
                    "--outdir",
                    str(temp_dir),
                    str(legacy_path),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            converted = temp_dir / f"{path.stem}.xlsx"
            if not converted.exists():
                raise RuntimeError(f"LibreOffice did not convert {path}")
            converted_path.write_bytes(converted.read_bytes())
    return xlsx_rows(converted_path)


def tx_gpa_group_key(value: Any) -> str | None:
    text = normalized(value)
    if text.startswith("four-year public universit"):
        return "publicFourYear"
    if text.startswith("two-year public college"):
        return "publicTwoYear"
    if text.startswith("independent colleges & universit"):
        return "independent"
    return TX_GPA_GROUPS.get(text)


def tx_gpa_group(row: list[str]) -> dict[str, Any]:
    students_raw = row[5] if len(row) > 5 else ""
    group: dict[str, Any] = {
        "students": parse_number(students_raw),
        "suppressed": compact(students_raw).startswith("<"),
    }
    bands = {
        key: parse_number(row[index + 6] if len(row) > index + 6 else "")
        for index, (key, _) in enumerate(TX_GPA_BANDS)
    }
    if any(value is not None for value in bands.values()):
        group["bands"] = bands
    return group


def tx_gpa_columns(rows: list[list[str]], path: Path) -> tuple[int, dict[str, int]]:
    aliases = {
        "county": ("county", "ctyname"),
        "district": ("district", "distname"),
        "campusCode": ("campus code", "teacampus"),
        "campus": ("campus", "campname"),
        "groupName": ("group name", "groupname"),
        "total": ("total graduates", "total"),
        "under2": ("<2.0",),
        "from2To249": ("2.0-2.49",),
        "from25To299": ("2.5-2.99",),
        "from3To349": ("3.0-3.49",),
        "over35": (">3.5",),
        "unknown": ("unknown", "unk"),
    }
    for header_index, row in enumerate(rows[:40]):
        headers = [normalized(cell) for cell in row]
        if not any(alias in headers for alias in aliases["groupName"]):
            continue
        columns: dict[str, int] = {}
        for key, candidates in aliases.items():
            match = next((headers.index(alias) for alias in candidates if alias in headers), None)
            if match is None:
                break
            columns[key] = match
        if len(columns) == len(aliases):
            return header_index, columns
    raise RuntimeError(f"Could not find Texas GPA header row in {path}")


def standardized_tx_gpa_row(row: list[str], columns: dict[str, int]) -> list[str]:
    def value(key: str) -> str:
        index = columns[key]
        return row[index] if index < len(row) else ""

    return [
        value("county"),
        value("district"),
        value("campusCode"),
        value("campus"),
        value("groupName"),
        value("total"),
        *(value(key) for key, _ in TX_GPA_BANDS),
    ]


def add_texas_gpa(schools: dict[str, dict[str, Any]]) -> None:
    for year in TX_YEARS:
        path = CACHE_DIR / f"texas-gpa-{year}.xlsx"
        fetch(
            TX_GPA_URL.format(start_year=year - 1, end_year=year),
            path,
        )
        rows = workbook_rows(path)

        header_index, columns = tx_gpa_columns(rows, path)

        for source_row in rows[header_index + 1 :]:
            row = standardized_tx_gpa_row(source_row, columns)
            if len(row) < 6:
                continue
            county, district, code_raw, school_name, group_name = row[:5]
            code = normalize_tx_campus_code(code_raw)
            group_key = tx_gpa_group_key(group_name)
            if not code or not group_key:
                continue

            school = schools.get(code)
            if not school:
                # The campus enrollment file is the canonical page inventory.
                continue
            year_data = school["years"].get(str(year))
            if not year_data:
                continue

            school["schoolName"] = clean_tx_name(school_name) or school["schoolName"]
            school["district"] = clean_tx_name(district) or school["district"]
            school["county"] = clean_tx_county(county) or school["county"]
            year_data.setdefault(
                "gpa",
                {
                    "sourceLabel": f"THECB {year - 1}-{year} graduates GPA report",
                    "sourceUrl": TX_GPA_URL.format(start_year=year - 1, end_year=year),
                },
            )[group_key] = tx_gpa_group(row)


def build_texas() -> dict[str, Any]:
    schools: dict[str, dict[str, Any]] = {}

    for year in TX_YEARS:
        path = CACHE_DIR / f"texas-campus-{year}.xlsx"
        fetch(TX_CAMPUS_URL.format(year=year), path)
        rows = workbook_rows(path)

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
            county, district, school_name, code_raw, institution, students_raw = row[:6]
            code = normalize_tx_campus_code(code_raw)
            if not code or not institution:
                continue

            students = parse_number(students_raw)
            if students is None:
                continue

            cleaned_county = clean_tx_county(county)
            school = schools.setdefault(
                code,
                {
                    "id": code,
                    "campusCode": code,
                    "schoolName": clean_tx_name(school_name),
                    "district": clean_tx_name(district),
                    "county": cleaned_county,
                    "state": "TX",
                    "years": {},
                },
            )
            school["schoolName"] = clean_tx_name(school_name) or school["schoolName"]
            school["district"] = clean_tx_name(district) or school["district"]
            school["county"] = cleaned_county or school["county"]
            year_data = school["years"].setdefault(
                str(year),
                {
                    "graduates": None,
                    "notFound": 0,
                    "notTrackable": 0,
                    "destinations": {},
                },
            )

            institution_key = normalized(institution)
            if institution_key.startswith("total high school graduates"):
                year_data["graduates"] = students
            elif institution_key.startswith("not found"):
                year_data["notFound"] += students
            elif institution_key.startswith("not trackable"):
                year_data["notTrackable"] += students
            else:
                destination = parse_tx_destination(institution, students)
                destination_key = (
                    f"fice:{destination['ficeCode']}"
                    if destination.get("ficeCode")
                    else f"label:{normalized(destination['name'])}"
                )
                existing = year_data["destinations"].get(destination_key)
                if existing:
                    existing["students"] += students
                    if destination.get("institutionCount"):
                        existing["institutionCount"] = max(
                            existing.get("institutionCount", 0),
                            destination["institutionCount"],
                        )
                else:
                    year_data["destinations"][destination_key] = destination

    add_texas_gpa(schools)

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
                year_data["destinations"].values(),
                key=lambda destination: (-destination["students"], destination["name"]),
            )
            destination_total = sum(row["students"] for row in destination_rows)
            ut_austin_enrollment = sum(
                row["students"]
                for row in destination_rows
                if row.get("ficeCode") == TX_UT_AUSTIN_FICE
            )

            year_data["trackableGraduates"] = trackable_graduates
            year_data["enrolled"] = enrolled
            year_data["enrollmentRate"] = rounded_rate(enrolled, trackable_graduates)
            year_data["coverageGap"] = not_found
            year_data["coverageGapRate"] = rounded_rate(not_found, trackable_graduates)
            year_data["destinationTotal"] = destination_total
            year_data["destinations"] = destination_rows
            year_data["utAustinEnrollment"] = ut_austin_enrollment
            year_data["utAustinShareOfGraduates"] = rounded_rate(
                ut_austin_enrollment,
                graduates,
            )
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
            "Fall 2024 by nine-digit campus code. Destination rows retain the source "
            "institution name, six-digit FICE code when reported, and all aggregate "
            "Other rows. GPA bands come from the separate THECB first-year GPA files. "
            "These are enrollment outcomes, not applications or admission offers."
        ),
        "gpaSourceLabel": "Texas Higher Education Coordinating Board first-year GPA files",
        "gpaSourceUrl": "https://www.txhighereddata.org/high-school-graduates/high-school-graduates-gpa-in-higher-education/",
        "utAustinFiceCode": TX_UT_AUSTIN_FICE,
        "years": [{"key": str(year), "label": str(year)} for year in TX_YEARS],
        "rateLabel": "Tracked enrollment rate",
        "coverageGapLabel": "Not found in covered Texas higher-ed records",
        "primaryCountLabel": "Graduates",
        "secondaryCountLabel": "Enrolled",
        "detailTitle": "Leading destinations",
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
