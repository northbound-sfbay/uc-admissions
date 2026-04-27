/**
 * UC Admissions School-Type Scraper
 *
 * Downloads Crosstab CSV for each school-type × year (1994-2025).
 * The Tableau dashboard has 5 school-type radio buttons (FIItem role=radio):
 *   - California public high school  → already in data/raw/year_YYYY.csv
 *   - California private high school → type_ca_private_year_YYYY.csv
 *   - Non-CA domestic high school    → type_nonca_domestic_year_YYYY.csv
 *   - Foreign institution            → type_foreign_year_YYYY.csv
 *   - Other                          → type_other_year_YYYY.csv
 *
 * Run: node type_scraper.js
 * Skip already-downloaded files automatically.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCHOOL_TYPES = [
  { label: 'California private high school', slug: 'ca_private' },
  { label: 'Non-CA domestic high school',    slug: 'nonca_domestic' },
  { label: 'Foreign institution',            slug: 'foreign' },
  { label: 'Other',                          slug: 'other' },
];

const FIRST_YEAR = 1994;
const LAST_YEAR = 2025;
const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
const DATA_DIR = path.join(__dirname, 'data', 'raw');
const TABLEAU_URL = 'https://visualizedata.ucop.edu/t/Public/views/AdmissionsDataTable/FREthbyYr?:embed=y&:tabs=y&:toolbar=bottom';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseCsvList(value) {
  return value ? value.split(',').map(v => v.trim()).filter(Boolean) : null;
}

function parseYears(value) {
  if (!value) return null;
  return new Set(
    value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => Number(v))
      .filter(v => Number.isInteger(v))
  );
}

function parseArgs(argv) {
  const args = { types: null, years: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--types') args.types = parseCsvList(argv[++i]);
    else if (arg === '--years') args.years = parseYears(argv[++i]);
  }
  return args;
}

async function waitForQuiet(page, quietMs = 2000, maxMs = 15000) {
  const t0 = Date.now(); let last = Date.now();
  const fn = () => { last = Date.now(); };
  page.on('request', fn);
  while (Date.now() - t0 < maxMs) {
    await sleep(400);
    if (Date.now() - last > quietMs) break;
  }
  page.off('request', fn);
}

async function jsClick(page, selector) {
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) throw new Error('Not found: ' + sel);
    el.click();
  }, selector);
}

/** Click the school-type radio button by its visible text label. */
async function selectSchoolType(page, label) {
  // Click the input.FICheckRadio inside the target FIItem at its actual coordinates.
  // Tableau's event handler only fires for a real pointer event on the input element.
  const box = await page.evaluate(lbl => {
    const inputs = [...document.querySelectorAll('input.FICheckRadio')];
    const target = inputs.find(inp => {
      const parent = inp.closest('.FIItem[role="radio"]');
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
}

/** Verify the correct school-type is selected. */
async function currentSchoolType(page) {
  return page.evaluate(() => {
    const checked = document.querySelector('.FIItem[role="radio"][aria-checked="true"]');
    return checked?.textContent?.trim() || null;
  });
}

/** Select a year via the first tabComboBox. */
async function selectYear(page, year) {
  const yearCombo = await page.$('.tabComboBox[role="button"]');
  await yearCombo.click();
  await sleep(1200);

  const option = await page.waitForSelector(`text="${year}"`, { timeout: 8000 });
  await option.click({ force: true });
  await sleep(800);
  await waitForQuiet(page, 1500, 10000);
}

/** Download crosstab CSV and save to savePath. Returns file size in bytes. */
async function downloadCrosstab(page, savePath) {
  // Open Download menu
  await page.click('[data-tb-test-id="viz-viewer-toolbar-button-download"]');
  await sleep(1200);

  const ct = await page.waitForSelector('text=Crosstab', { timeout: 8000 });
  await ct.click();
  await sleep(1200);

  await page.waitForSelector('[data-tb-test-id="export-crosstab-export-Button"]', { timeout: 8000 });

  // Select CSV
  await jsClick(page, '[data-tb-test-id="crosstab-options-dialog-radio-csv-Label"]');
  await sleep(400);

  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 45000 }),
    jsClick(page, '[data-tb-test-id="export-crosstab-export-Button"]'),
  ]);

  await dl.saveAs(savePath);
  return fs.statSync(savePath).size;
}

async function recover(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await sleep(400);
  }
  await sleep(1000);
}

async function main() {
  const { types: typeFilter, years: yearFilter } = parseArgs(process.argv.slice(2));
  const selectedTypes = SCHOOL_TYPES.filter(st => !typeFilter || typeFilter.includes(st.slug));
  const selectedYears = yearFilter ?? new Set(YEARS);

  if (selectedTypes.length === 0) {
    console.log('No matching school types selected.');
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Build work list — skip already-downloaded files
  const work = [];
  for (const stype of selectedTypes) {
    for (const year of YEARS) {
      if (!selectedYears.has(year)) continue;
      const fname = `type_${stype.slug}_year_${year}.csv`;
      const fpath = path.join(DATA_DIR, fname);
      if (!fs.existsSync(fpath)) {
        work.push({ stype, year, fname, fpath });
      }
    }
  }

  if (work.length === 0) {
    console.log('All school-type files already downloaded.');
    return;
  }

  const total = selectedTypes.length * selectedYears.size;
  console.log(`Work items: ${work.length} of ${total} remaining\n`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('Loading Tableau...');
  await page.goto(TABLEAU_URL, { waitUntil: 'load', timeout: 60000 });
  await waitForQuiet(page, 3000, 25000);
  console.log('Ready.\n');

  let currentType = 'California public high school'; // default on load
  const errors = [];
  let done = 0;

  for (const { stype, year, fname, fpath } of work) {
    try {
      // Switch school type if needed
      if (stype.label !== currentType) {
        process.stdout.write(`\nSwitching to: ${stype.label}\n`);
        await selectSchoolType(page, stype.label);
        const actual = await currentSchoolType(page);
        if (actual !== stype.label) {
          throw new Error(`Type mismatch: expected "${stype.label}", got "${actual}"`);
        }
        currentType = stype.label;
      }

      process.stdout.write(`  ${stype.slug} / ${year} ... `);
      await selectYear(page, year);
      const size = await downloadCrosstab(page, fpath);

      done++;
      console.log(`OK (${(size / 1024).toFixed(1)} KB) [${done}/${work.length}]`);
      await sleep(1500);

    } catch (err) {
      console.log(`ERROR: ${err.message.split('\n')[0]}`);
      errors.push({ slug: stype.slug, year, error: err.message.split('\n')[0] });
      await recover(page);
      currentType = 'UNKNOWN'; // force re-select on next iteration
    }
  }

  await browser.close();

  console.log('\n=== DONE ===');
  console.log(`Success: ${done}/${work.length}`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.slice(0, 20).forEach(e => console.log(`  ${e.slug}/${e.year}: ${e.error}`));
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
