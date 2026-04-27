/**
 * UC Admissions school-type × campus scraper.
 *
 * Downloads Crosstab CSV for each selected school-type × campus × year.
 * Output: data/raw/type_campus_{TYPE_SLUG}_{CAMPUS_SLUG}_year_{YYYY}.csv
 *
 * Defaults to the non-public school types, but supports filtering:
 *   node type_campus_scraper.js --types ca_private
 *   node type_campus_scraper.js --types ca_private --campuses berkeley,davis --years 2025
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FIRST_YEAR = 1994;
const LAST_YEAR = 2025;
const TABLEAU_URL = 'https://visualizedata.ucop.edu/t/Public/views/AdmissionsDataTable/FREthbyYr?:embed=y&:tabs=y&:toolbar=bottom';
const DATA_DIR = path.join(__dirname, 'data', 'raw');

const SCHOOL_TYPES = [
  { label: 'California private high school', slug: 'ca_private' },
  { label: 'Non-CA domestic high school', slug: 'nonca_domestic' },
  { label: 'Foreign institution', slug: 'foreign' },
  { label: 'Other', slug: 'other' },
];

const CAMPUSES = [
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
  const args = { types: null, campuses: null, years: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--types') args.types = parseCsvList(argv[++i]);
    else if (arg === '--campuses') args.campuses = parseCsvList(argv[++i]);
    else if (arg === '--years') args.years = parseYears(argv[++i]);
  }
  return args;
}

async function waitForQuiet(page, quietMs = 2000, maxMs = 15000) {
  const t0 = Date.now();
  let last = Date.now();
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

async function selectSchoolType(page, label) {
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

async function currentSchoolType(page) {
  return page.evaluate(() => {
    const checked = document.querySelector('.FIItem[role="radio"][aria-checked="true"]');
    return checked?.textContent?.trim() || null;
  });
}

async function currentCampus(page) {
  const names = await page.$$eval('.tabComboBoxName', els => els.map(el => el.textContent?.trim()));
  return names[1] || 'Universitywide';
}

async function selectCampus(page, campus) {
  const current = await currentCampus(page);
  const campusCombo = await page.$('.tabComboBoxName:text("' + current + '")');
  const parent = await campusCombo?.$('xpath=..');
  await parent?.click();
  await sleep(1500);

  const option = await page.$(`text="${campus}"`);
  if (!option) throw new Error(`Campus option "${campus}" not found`);
  await option.click({ force: true });
  await sleep(1000);
  await waitForQuiet(page, 2000, 12000);
}

async function selectYear(page, year) {
  const yearCombo = await page.$('.tabComboBox[role="button"]');
  await yearCombo.click();
  await sleep(1200);

  const option = await page.waitForSelector(`text="${year}"`, { timeout: 8000 });
  await option.click({ force: true });
  await sleep(800);
  await waitForQuiet(page, 1500, 10000);
}

async function downloadCrosstab(page, savePath) {
  await page.click('[data-tb-test-id="viz-viewer-toolbar-button-download"]');
  await sleep(1200);

  const ct = await page.waitForSelector('text=Crosstab', { timeout: 8000 });
  await ct.click();
  await sleep(1200);

  await page.waitForSelector('[data-tb-test-id="export-crosstab-export-Button"]', { timeout: 8000 });
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
  const { types: typeFilter, campuses: campusFilter, years: yearFilter } = parseArgs(process.argv.slice(2));
  const selectedTypes = SCHOOL_TYPES.filter(t => !typeFilter || typeFilter.includes(t.slug));
  const selectedCampuses = CAMPUSES.filter(c => !campusFilter || campusFilter.includes(c.slug));

  if (selectedTypes.length === 0) throw new Error('No matching school types selected.');
  if (selectedCampuses.length === 0) throw new Error('No matching campuses selected.');

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const work = [];
  for (const stype of selectedTypes) {
    for (const campus of selectedCampuses) {
      for (let year = campus.minYear; year <= LAST_YEAR; year++) {
        if (yearFilter && !yearFilter.has(year)) continue;
        const fname = `type_campus_${stype.slug}_${campus.slug}_year_${year}.csv`;
        const fpath = path.join(DATA_DIR, fname);
        if (!fs.existsSync(fpath)) {
          work.push({ stype, campus, year, fname, fpath });
        }
      }
    }
  }

  if (work.length === 0) {
    console.log('All requested school-type campus files already downloaded.');
    return;
  }

  console.log(`Work items: ${work.length}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('Loading Tableau...');
  await page.goto(TABLEAU_URL, { waitUntil: 'load', timeout: 60000 });
  await waitForQuiet(page, 3000, 25000);
  console.log('Ready.\n');

  let currentType = 'California public high school';
  let currentCampusName = 'Universitywide';
  const errors = [];
  let done = 0;

  for (const { stype, campus, year, fpath } of work) {
    try {
      if (stype.label !== currentType) {
        process.stdout.write(`\nSwitching to school type: ${stype.label}\n`);
        await selectSchoolType(page, stype.label);
        const actual = await currentSchoolType(page);
        if (actual !== stype.label) {
          throw new Error(`Type mismatch: expected "${stype.label}", got "${actual}"`);
        }
        currentType = stype.label;
        currentCampusName = 'UNKNOWN';
      }

      if (campus.name !== currentCampusName) {
        process.stdout.write(`Switching to campus: ${campus.name}\n`);
        await selectCampus(page, campus.name);
        currentCampusName = campus.name;
      }

      process.stdout.write(`  ${stype.slug} / ${campus.slug} / ${year} ... `);
      await selectYear(page, year);
      const size = await downloadCrosstab(page, fpath);

      done++;
      console.log(`OK (${(size / 1024).toFixed(1)} KB) [${done}/${work.length}]`);
      await sleep(1200);
    } catch (err) {
      console.log(`ERROR: ${err.message.split('\n')[0]}`);
      errors.push({ schoolType: stype.slug, campus: campus.slug, year, error: err.message.split('\n')[0] });
      await recover(page);
      currentType = 'UNKNOWN';
      currentCampusName = 'UNKNOWN';
    }
  }

  await browser.close();

  console.log('\n=== DONE ===');
  console.log(`Success: ${done}/${work.length}`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.slice(0, 20).forEach(e => console.log(`  ${e.schoolType}/${e.campus}/${e.year}: ${e.error}`));
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
