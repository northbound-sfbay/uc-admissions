/**
 * UC Campus Scraper
 *
 * Downloads Crosstab CSV for each UC campus × year (1994-2025).
 * Output: data/raw/campus_{CAMPUS_SLUG}_year_{YYYY}.csv
 *
 * Campuses: Berkeley, Davis, Irvine, Los Angeles, Merced,
 *           Riverside, San Diego, Santa Barbara, Santa Cruz
 *
 * Strategy: keep one browser session, switch campus then year,
 *           download crosstab, repeat.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FIRST_YEAR = 1994;
const LAST_YEAR = 2025;
const CAMPUSES = [
  { name: 'Berkeley', minYear: FIRST_YEAR },
  { name: 'Davis', minYear: FIRST_YEAR },
  { name: 'Irvine', minYear: FIRST_YEAR },
  { name: 'Los Angeles', minYear: FIRST_YEAR },
  { name: 'Merced', minYear: 2004 },
  { name: 'Riverside', minYear: FIRST_YEAR },
  { name: 'San Diego', minYear: FIRST_YEAR },
  { name: 'Santa Barbara', minYear: FIRST_YEAR },
  { name: 'Santa Cruz', minYear: FIRST_YEAR },
];

const DATA_DIR = path.join(__dirname, 'data', 'raw');
const TABLEAU_URL = 'https://visualizedata.ucop.edu/t/Public/views/AdmissionsDataTable/FREthbyYr?:embed=y&:tabs=y&:toolbar=bottom';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function campusSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '_');
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

async function jsClick(page, sel) {
  await page.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) throw new Error('Not found: ' + s);
    el.click();
  }, sel);
}

async function selectCampus(page, campus) {
  // The campus combobox shows "Universitywide" initially.
  // We click it, then select the desired campus from the popup.
  const campusCombo = await page.$('.tabComboBoxName:text("' + (await getCurrentCampus(page)) + '")');
  const parent = await campusCombo?.$('xpath=..');
  await parent?.click();
  await sleep(1500);

  // Find and click the campus option
  const option = await page.$(`text="${campus}"`);
  if (!option) throw new Error(`Campus option "${campus}" not found`);
  await option.click({ force: true });
  await sleep(1000);
  await waitForQuiet(page, 2000, 12000);
}

async function getCurrentCampus(page) {
  // Second tabComboBoxName is the campus
  const names = await page.$$eval('.tabComboBoxName', els => els.map(el => el.textContent?.trim()));
  return names[1] || 'Universitywide';
}

async function selectYear(page, year) {
  // First tabComboBoxName is the year
  const yearCombo = await page.$('.tabComboBox[role="button"]');
  await yearCombo.click();
  await sleep(1200);

  const option = await page.waitForSelector(`text="${year}"`, { timeout: 8000 });
  await option.click({ force: true });
  await sleep(800);
  await waitForQuiet(page, 1500, 10000);
}

async function downloadCrosstab(page, savePath) {
  // Open Download menu
  await page.click('[data-tb-test-id="viz-viewer-toolbar-button-download"]');
  await sleep(1200);

  // Click Crosstab
  const ct = await page.waitForSelector('text=Crosstab', { timeout: 8000 });
  await ct.click();
  await sleep(1200);

  // Wait for dialog
  await page.waitForSelector('[data-tb-test-id="export-crosstab-export-Button"]', { timeout: 8000 });

  // Select CSV
  await jsClick(page, '[data-tb-test-id="crosstab-options-dialog-radio-csv-Label"]');
  await sleep(400);

  // Download
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 45000 }),
    jsClick(page, '[data-tb-test-id="export-crosstab-export-Button"]')
  ]);

  await dl.saveAs(savePath);
  const size = fs.statSync(savePath).size;
  return size;
}

async function recover(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await sleep(400);
  }
  await sleep(1000);
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Build work list, skip already-downloaded files
  const work = [];
  for (const { name: campus, minYear } of CAMPUSES) {
    for (let year = minYear; year <= LAST_YEAR; year++) {
      const fname = `campus_${campusSlug(campus)}_year_${year}.csv`;
      const fpath = path.join(DATA_DIR, fname);
      if (!fs.existsSync(fpath)) {
        work.push({ campus, year, fname, fpath });
      }
    }
  }

  if (work.length === 0) {
    console.log('All campus files already downloaded.');
    return;
  }

  const total = CAMPUSES.reduce((sum, { minYear }) => sum + (LAST_YEAR - minYear + 1), 0);
  const alreadyDone = total - work.length;
  console.log(`Work items: ${work.length} remaining (${alreadyDone} already done)`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('Loading Tableau...');
  await page.goto(TABLEAU_URL, { waitUntil: 'load', timeout: 60000 });
  await waitForQuiet(page, 3000, 25000);
  console.log('Ready.\n');

  let currentCampus = 'Universitywide';
  const errors = [];
  let done = 0;

  for (const { campus, year, fname, fpath } of work) {
    try {
      // Switch campus if needed
      if (campus !== currentCampus) {
        process.stdout.write(`\nSwitching to campus: ${campus}\n`);
        await selectCampus(page, campus);
        currentCampus = campus;
      }

      process.stdout.write(`  ${campus} / ${year} ... `);
      await selectYear(page, year);
      const size = await downloadCrosstab(page, fpath);

      done++;
      console.log(`OK (${(size / 1024).toFixed(1)} KB) [${done}/${work.length}]`);
      await sleep(1500);

    } catch (err) {
      console.log(`ERROR: ${err.message.split('\n')[0]}`);
      errors.push({ campus, year, error: err.message.split('\n')[0] });
      await recover(page);
      // Reset campus tracking so it gets re-selected on next iteration
      currentCampus = 'UNKNOWN';
    }
  }

  await browser.close();

  console.log('\n=== DONE ===');
  console.log(`Success: ${done}/${work.length}`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.slice(0, 20).forEach(e => console.log(`  ${e.campus}/${e.year}: ${e.error}`));
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
