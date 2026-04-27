/**
 * UC freshman GPA by source school scraper.
 *
 * Downloads Tableau Crosstab CSVs from the "FR GPA by Yr" tab for:
 *   - California public high school
 *   - California private high school
 *   - Non-CA domestic high school
 *   - Foreign institution
 *
 * Output: data/raw_gpa/gpa_{TYPE}_{CAMPUS_SCOPE}_year_{YYYY}.csv
 *
 * Examples:
 *   node gpa_scraper.js --types ca_public --campuses universitywide --years 2025 --limit 1
 *   node gpa_scraper.js --types ca_public,ca_private --campuses universitywide,berkeley --years 2025,2024
 *   node gpa_scraper.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FIRST_YEAR = 1994;
const LAST_YEAR = 2025;
const TABLEAU_URL = 'https://visualizedata.ucop.edu/t/Public/views/AdmissionsDataTable/FRGPAbyYr?:embed=y&:tabs=y&:toolbar=bottom';
const DATA_DIR = path.join(__dirname, 'data', 'raw_gpa');

const SCHOOL_TYPES = [
  { label: 'California public high school', slug: 'ca_public' },
  { label: 'California private high school', slug: 'ca_private' },
  { label: 'Non-CA domestic high school', slug: 'nonca_domestic' },
  { label: 'Foreign institution', slug: 'foreign' },
];

const CAMPUS_SCOPES = [
  { name: 'Universitywide', slug: 'universitywide', minYear: FIRST_YEAR },
  { name: 'Berkeley', slug: 'berkeley', minYear: FIRST_YEAR },
  { name: 'Davis', slug: 'davis', minYear: FIRST_YEAR },
  { name: 'Irvine', slug: 'irvine', minYear: FIRST_YEAR },
  { name: 'Los Angeles', slug: 'los_angeles', minYear: FIRST_YEAR },
  { name: 'Merced', slug: 'merced', minYear: 2004 },
  { name: 'Riverside', slug: 'riverside', minYear: FIRST_YEAR },
  { name: 'San Diego', slug: 'san_diego', minYear: FIRST_YEAR },
  { name: 'Santa Barbara', slug: 'santa_barbara', minYear: FIRST_YEAR },
  { name: 'Santa Cruz', slug: 'santa_cruz', minYear: FIRST_YEAR },
];

const YEARS_DESC = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, i) => LAST_YEAR - i
);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCsvList(value) {
  return value ? value.split(',').map(v => v.trim()).filter(Boolean) : null;
}

function parseYears(value) {
  if (!value) return null;
  return new Set(
    value
      .split(',')
      .map(v => Number(v.trim()))
      .filter(v => Number.isInteger(v))
  );
}

function parseArgs(argv) {
  const args = {
    types: null,
    campuses: null,
    years: null,
    limit: null,
    force: false,
    headful: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--types') args.types = parseCsvList(argv[++i]);
    else if (arg === '--campuses') args.campuses = parseCsvList(argv[++i]);
    else if (arg === '--years') args.years = parseYears(argv[++i]);
    else if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--force') args.force = true;
    else if (arg === '--headful') args.headful = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.limit !== null && (!Number.isInteger(args.limit) || args.limit < 1)) {
    throw new Error('--limit must be a positive integer');
  }

  return args;
}

async function waitForQuiet(page, quietMs = 2000, maxMs = 15000) {
  const t0 = Date.now();
  let last = Date.now();
  const mark = () => { last = Date.now(); };
  page.on('request', mark);

  while (Date.now() - t0 < maxMs) {
    await sleep(400);
    if (Date.now() - last > quietMs) break;
  }

  page.off('request', mark);
}

async function jsClick(page, selector) {
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Not found: ${sel}`);
    el.click();
  }, selector);
}

async function clickTextOption(page, label) {
  const matches = page.getByText(label, { exact: true });
  const count = await matches.count();

  for (let i = count - 1; i >= 0; i--) {
    const option = matches.nth(i);
    const visible = await option.isVisible().catch(() => false);
    if (!visible) continue;

    await option.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await option.click({ force: true, timeout: 5000 });
      return;
    } catch (_) {
      // Try the next matching text node, then fall back to DOM events below.
    }
  }

  const clicked = await page.evaluate(value => {
    const candidates = [...document.querySelectorAll('*')]
      .filter(el => el.textContent?.trim() === value)
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

    const target = candidates[candidates.length - 1];
    if (!target) return false;

    target.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = target.getBoundingClientRect();
    const x = Math.min(Math.max(rect.left + rect.width / 2, 1), window.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 1), window.innerHeight - 1);
    for (const type of ['mousedown', 'mouseup', 'click']) {
      target.dispatchEvent(new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }));
    }
    return true;
  }, label);

  if (!clicked) throw new Error(`Option not found: "${label}"`);
}

async function comboBoxNames(page) {
  return page.$$eval('.tabComboBoxName', els => els.map(el => el.textContent?.trim()).filter(Boolean));
}

async function currentYear(page) {
  const names = await comboBoxNames(page);
  const year = Number(names[0]);
  return Number.isInteger(year) ? year : null;
}

async function currentCampus(page) {
  const names = await comboBoxNames(page);
  return names[1] || null;
}

async function currentSchoolType(page) {
  return page.evaluate(() => {
    const checked = document.querySelector('.FIItem[role="radio"][aria-checked="true"]');
    return checked?.textContent?.trim() || null;
  });
}

async function hasGpaSheet(page) {
  const text = await page.evaluate(() => document.body?.innerText || '');
  return text.includes('Fall freshman average GPA') || text.includes('average GPA by high school');
}

async function ensureGpaSheet(page) {
  for (let i = 0; i < 20; i++) {
    if (await hasGpaSheet(page)) return;
    await sleep(500);
  }

  const tab = page.locator('.tabLabel[value="FR GPA by Yr"]').first();
  if (await tab.count()) {
    await tab.click({ force: true });
    await sleep(2500);
    await waitForQuiet(page, 3000, 25000);
  }

  if (!(await hasGpaSheet(page))) {
    const title = (await page.evaluate(() => document.body?.innerText || '')).split('\n')[0];
    throw new Error(`GPA sheet not detected; current sheet title looks like "${title}"`);
  }
}

async function selectSchoolType(page, label) {
  const current = await currentSchoolType(page);
  if (current === label) return;

  const box = await page.evaluate(lbl => {
    const inputs = [...document.querySelectorAll('input.FICheckRadio')];
    const target = inputs.find(input => {
      const parent = input.closest('.FIItem[role="radio"]');
      return parent?.textContent?.trim() === lbl;
    });
    if (!target) return null;
    const r = target.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, label);

  if (!box) throw new Error(`School-type radio input not found: "${label}"`);

  await page.mouse.click(box.x, box.y);
  await sleep(1000);
  await waitForQuiet(page, 2000, 12000);

  const actual = await currentSchoolType(page);
  if (actual !== label) {
    throw new Error(`School type mismatch: expected "${label}", got "${actual}"`);
  }
}

async function selectYear(page, year) {
  const current = await currentYear(page);
  if (current === year) return;

  const combos = await page.$$('.tabComboBox[role="button"]');
  if (!combos[0]) throw new Error('Year combobox not found');

  await combos[0].click();
  await sleep(1000);

  await page.waitForSelector(`text="${year}"`, { timeout: 8000 });
  await clickTextOption(page, String(year));
  await sleep(800);
  await waitForQuiet(page, 1500, 10000);

  const actual = await currentYear(page);
  if (actual !== year) {
    throw new Error(`Year mismatch: expected ${year}, got ${actual}`);
  }
}

async function selectCampus(page, campusName) {
  const current = await currentCampus(page);
  if (current === campusName) return;

  const combos = await page.$$('.tabComboBox[role="button"]');
  if (!combos[1]) throw new Error('Campus combobox not found');

  await combos[1].click();
  await sleep(1200);

  await page.waitForSelector(`text="${campusName}"`, { timeout: 8000 });
  await clickTextOption(page, campusName);
  await sleep(1000);
  await waitForQuiet(page, 2000, 12000);

  const actual = await currentCampus(page);
  if (actual !== campusName) {
    throw new Error(`Campus mismatch: expected "${campusName}", got "${actual}"`);
  }
}

async function downloadCrosstab(page, savePath) {
  await page.click('[data-tb-test-id="viz-viewer-toolbar-button-download"]');
  await sleep(1200);

  const crosstab = await page.waitForSelector('text=Crosstab', { timeout: 8000 });
  await crosstab.click();
  await sleep(1200);

  await page.waitForSelector('[data-tb-test-id="export-crosstab-export-Button"]', { timeout: 10000 });
  await jsClick(page, '[data-tb-test-id="crosstab-options-dialog-radio-csv-Label"]');
  await sleep(400);

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 25000 }),
    jsClick(page, '[data-tb-test-id="export-crosstab-export-Button"]'),
  ]);

  await download.saveAs(savePath);
  return fs.statSync(savePath).size;
}

function writeEmptyCrosstab(savePath) {
  const header = 'Calculation1\tSchool\tCity\tCounty/State/ Country\tApp GPA\tAdm GPA\tEnrl GPA\r\n';
  fs.writeFileSync(savePath, Buffer.from(`\ufeff${header}`, 'utf16le'));
  return fs.statSync(savePath).size;
}

function isDownloadTimeout(message) {
  return message.includes('Timeout') && message.includes('download');
}

async function recover(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await sleep(400);
  }
  await sleep(1000);
}

async function loadWorkbook(page) {
  await page.goto(TABLEAU_URL, { waitUntil: 'load', timeout: 60000 });
  await waitForQuiet(page, 3000, 25000);
  await ensureGpaSheet(page);
}

function buildWork({ selectedTypes, selectedCampuses, selectedYears, force }) {
  const work = [];

  for (const stype of selectedTypes) {
    for (const campus of selectedCampuses) {
      for (const year of YEARS_DESC) {
        if (year < campus.minYear) continue;
        if (selectedYears && !selectedYears.has(year)) continue;

        const fname = `gpa_${stype.slug}_${campus.slug}_year_${year}.csv`;
        const fpath = path.join(DATA_DIR, fname);
        if (force || !fs.existsSync(fpath)) {
          work.push({ stype, campus, year, fname, fpath });
        }
      }
    }
  }

  return work;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const selectedTypes = SCHOOL_TYPES.filter(stype => !args.types || args.types.includes(stype.slug));
  const selectedCampuses = CAMPUS_SCOPES.filter(campus => !args.campuses || args.campuses.includes(campus.slug));

  if (selectedTypes.length === 0) throw new Error('No matching school types selected.');
  if (selectedCampuses.length === 0) throw new Error('No matching campuses selected.');

  fs.mkdirSync(DATA_DIR, { recursive: true });

  let work = buildWork({
    selectedTypes,
    selectedCampuses,
    selectedYears: args.years,
    force: args.force,
  });

  if (args.limit !== null) work = work.slice(0, args.limit);

  const yearCount = args.years ? args.years.size : YEARS_DESC.length;
  console.log(`Selected types: ${selectedTypes.map(t => t.slug).join(', ')}`);
  console.log(`Selected campus scopes: ${selectedCampuses.map(c => c.slug).join(', ')}`);
  console.log(`Selected year count: ${yearCount}`);
  console.log(`Work items: ${work.length}${args.force ? ' (--force)' : ''}\n`);

  if (work.length === 0) {
    console.log('All requested GPA files already downloaded.');
    return;
  }

  if (args.dryRun) {
    work.slice(0, 30).forEach(item => console.log(item.fname));
    if (work.length > 30) console.log(`... ${work.length - 30} more`);
    return;
  }

  const browser = await chromium.launch({
    headless: !args.headful,
    args: ['--no-sandbox'],
  });
  const ctx = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  console.log('Loading Tableau...');
  await loadWorkbook(page);
  console.log('Ready on FR GPA by Yr.\n');

  let currentType = await currentSchoolType(page);
  let currentCampusName = await currentCampus(page);
  let done = 0;
  let empty = 0;
  const errors = [];

  for (const { stype, campus, year, fpath } of work) {
    let success = false;

    for (let attempt = 1; attempt <= 2 && !success; attempt++) {
      try {
        if (stype.label !== currentType) {
          process.stdout.write(`\nSwitching to school type: ${stype.label}\n`);
          await selectSchoolType(page, stype.label);
          currentType = stype.label;
          currentCampusName = null;
        }

        if (campus.name !== currentCampusName) {
          process.stdout.write(`Switching to campus scope: ${campus.name}\n`);
          await selectCampus(page, campus.name);
          currentCampusName = campus.name;
        }

        process.stdout.write(`  ${stype.slug} / ${campus.slug} / ${year} ... `);
        await selectYear(page, year);
        const size = await downloadCrosstab(page, fpath);

        done += 1;
        success = true;
        console.log(`OK (${(size / 1024).toFixed(1)} KB) [${done}/${work.length}]`);
        await sleep(1200);
      } catch (err) {
        const message = err.message.split('\n')[0];
        const downloadTimeout = isDownloadTimeout(message);
        const retrying = attempt < 2 && !downloadTimeout;
        console.log(`ERROR: ${message}${retrying ? ' (reloading and retrying)' : ''}`);

        await recover(page).catch(() => {});
        currentType = null;
        currentCampusName = null;

        if (retrying) {
          await loadWorkbook(page);
          currentType = await currentSchoolType(page);
          currentCampusName = await currentCampus(page);
          continue;
        }

        if (downloadTimeout) {
          const size = writeEmptyCrosstab(fpath);
          done += 1;
          empty += 1;
          success = true;
          console.log(`EMPTY (${(size / 1024).toFixed(1)} KB header-only marker) [${done}/${work.length}]`);
          await loadWorkbook(page);
          currentType = await currentSchoolType(page);
          currentCampusName = await currentCampus(page);
          continue;
        }

        errors.push({ schoolType: stype.slug, campus: campus.slug, year, error: message });
        await loadWorkbook(page);
        currentType = await currentSchoolType(page);
        currentCampusName = await currentCampus(page);
      }
    }
  }

  await browser.close();

  console.log('\n=== DONE ===');
  console.log(`Success: ${done}/${work.length}`);
  if (empty) console.log(`Header-only empty markers: ${empty}`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.slice(0, 30).forEach(e => {
      console.log(`  ${e.schoolType}/${e.campus}/${e.year}: ${e.error}`);
    });
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
