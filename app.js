/**
 * UC Admissions by High School
 * Layout: Two charts (Time Series + Compare) side-by-side · Full-width map below
 */

// ─── Constants ────────────────────────────────────────────────────────────────

// Per-type data files (lazy-loaded on demand)
const TYPE_DATA_URLS = {
  'CA Public':       'data/admissions_ca_public.json',
  'CA Private':      'data/admissions_ca_private.json',
  'Non-CA Domestic': 'data/admissions_nonca_domestic.json',
  'Foreign':         'data/admissions_foreign.json',
  'Other':           'data/admissions_other.json',
};
const COORDS_URL           = 'data/school_coords.json';
const NONPUBLIC_COORDS_URL = 'data/school_coords_nonpublic.json';
const COUNTIES_URL         = 'data/ca_counties.geojson';

const ALL_YEARS    = Array.from({length: 32}, (_, i) => String(1994 + i));
const RECENT_YEARS = ALL_YEARS.slice(-3);  // last 3 years for "active school" filter

const CMP_COLORS = [
  '#003262', '#e85d04', '#16a34a', '#dc2626',
  '#7c3aed', '#0284c7', '#b45309', '#0f766e',
];

const ADMIT_HIGH = '#16a34a';
const ADMIT_MID  = '#d97706';
const ADMIT_LOW  = '#dc2626';
const ADMIT_NONE = '#94a3b8';

// Map center/zoom per school type (for non-CA types we zoom out)
const TYPE_MAP_VIEW = {
  'CA Public':      { center: [37.0, -119.5], zoom: 6 },
  'CA Private':     { center: [37.0, -119.5], zoom: 6 },
  'Other':          { center: [37.0, -119.5], zoom: 6 },
  'Non-CA Domestic':{ center: [38.0, -96.0],  zoom: 4 },
  'Foreign':        { center: [20.0,   0.0],  zoom: 2 },
  'all':            { center: [37.0, -119.5], zoom: 5 },
};

// ─── State ────────────────────────────────────────────────────────────────────

let allSchools     = [];          // schools for the currently loaded type(s)
let loadedTypes    = new Set();   // which type data files have been fetched
let schoolsByType  = {};          // school_type → [school, ...]
let schoolCoords   = {};          // "${school_type}:${school_id}" → {lat, lng}
let allCounties    = [];

// Time series
let tsSelectedSchool = null;
let tsChart          = null;

// Map
let map              = null;
let mapMarkers       = [];
let countyLayer      = null;

// Compare
let cmpSelectedSchools = [];  // [{school, colorIdx}, ...]
let cmpChart           = null;

// ─── Utilities ────────────────────────────────────────────────────────────────

const pct = v => (v == null ? '—' : (v * 100).toFixed(1) + '%');
const fmt = v => (v == null ? '—' : v.toLocaleString());

/** Composite key used in schoolCoords and compare dedup. */
const schoolKey = s => `${s.school_type ?? 'CA Public'}:${s.school_id}`;

/** Returns array of checked school types from the map filter. */
function getSelectedSchoolTypes() {
  return Array.from(document.querySelectorAll('#map-school-type input[type="checkbox"]:checked'))
    .map(cb => cb.value);
}

/** Update the dropdown button label to reflect current selection. */
function updateTypeDropdownLabel() {
  const sel = getSelectedSchoolTypes();
  const label = document.getElementById('map-school-type-label');
  if (!label) return;
  if (sel.length === 0)       label.textContent = 'All types';
  else if (sel.length === 1)  label.textContent = sel[0];
  else if (sel.length === 2)  label.textContent = sel.join(', ');
  else                        label.textContent = `${sel.length} types selected`;
}

/** Shared handler for map type checkbox changes. */
async function handleMapTypeChange() {
  updateTypeDropdownLabel();
  const types = getSelectedSchoolTypes();
  const caTypes = new Set(['CA Public', 'CA Private', 'Other']);
  const showCounty = types.length === 0 || types.some(t => caTypes.has(t));
  document.getElementById('map-county-group').style.display = showCounty ? '' : 'none';
  if (!showCounty) document.getElementById('map-county').value = '';

  const toLoad = types.filter(t => !loadedTypes.has(t) && TYPE_DATA_URLS[t]);
  if (toLoad.length > 0) {
    document.getElementById('loading-msg').textContent = `Loading ${toLoad.join(', ')} data…`;
    document.getElementById('loading-overlay').classList.remove('hidden');
    await Promise.all(types.map(t => ensureTypeLoaded(t)));
    document.getElementById('loading-overlay').classList.add('hidden');
  } else {
    allSchools = Object.values(schoolsByType).flat();
  }
  updateMap();
}

function getYearData(yearObj, campus, ethnicity) {
  if (!yearObj) return null;
  if (campus === 'universitywide') {
    return ethnicity === 'all' ? yearObj : (yearObj.by_ethnicity?.[ethnicity] ?? null);
  }
  // Campus breakdown has no per-ethnicity split
  return ethnicity === 'all' ? (yearObj.by_campus?.[campus] ?? null) : null;
}

function yieldRate(d) {
  if (!d || !d.adm || d.enr == null) return null;
  return d.enr / d.adm;
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function loadData() {
  document.getElementById('loading-msg').textContent = 'Loading admissions data…';

  // Load CA Public + CA Private at startup so all CA schools are searchable
  const [caPublicSchools, caPrivateSchools, pubCoords, nonpubCoords] = await Promise.all([
    fetch(TYPE_DATA_URLS['CA Public']).then(r => r.json()),
    fetch(TYPE_DATA_URLS['CA Private']).then(r => r.json()).catch(() => []),
    fetch(COORDS_URL).then(r => r.json()),
    fetch(NONPUBLIC_COORDS_URL).then(r => r.json()).catch(() => []),
  ]);

  schoolsByType['CA Public']  = caPublicSchools;
  schoolsByType['CA Private'] = caPrivateSchools;
  loadedTypes.add('CA Public');
  loadedTypes.add('CA Private');
  allSchools = [...caPublicSchools, ...caPrivateSchools];

  // County dropdown: CA counties from public schools
  allCounties = [...new Set(
    caPublicSchools.map(s => s.county).filter(Boolean)
  )].sort();

  for (const c of [...pubCoords, ...nonpubCoords]) {
    schoolCoords[`${c.school_type ?? 'CA Public'}:${c.school_id}`] = {lat: c.lat, lng: c.lng};
  }

  document.getElementById('loading-overlay').classList.add('hidden');
  init();

  // Load county outlines asynchronously
  fetch(COUNTIES_URL).then(r => r.json()).then(addCountyLayer).catch(() => {});

  // Background-load Foreign data so those schools are immediately searchable
  fetch(TYPE_DATA_URLS['Foreign']).then(r => r.json()).then(schools => {
    schoolsByType['Foreign'] = schools;
    loadedTypes.add('Foreign');
    allSchools = Object.values(schoolsByType).flat();
  }).catch(() => {});
}

/** Lazy-load data for a school type if not yet loaded. Updates allSchools. */
async function ensureTypeLoaded(schoolType) {
  if (!loadedTypes.has(schoolType) && TYPE_DATA_URLS[schoolType]) {
    try {
      const schools = await fetch(TYPE_DATA_URLS[schoolType]).then(r => r.json());
      schoolsByType[schoolType] = schools;
      loadedTypes.add(schoolType);
    } catch (e) {
      schoolsByType[schoolType] = [];
    }
  }
  allSchools = Object.values(schoolsByType).flat();
}

function init() {
  setupTimeSeries();
  setupCompare();
  setupMap();
  initMap();
  applyUrlParam();
}

/** Read ?school=ID from the URL and pre-select that school. */
function applyUrlParam() {
  const id = new URLSearchParams(window.location.search).get('school');
  if (!id) return;
  const school = allSchools.find(s => s.school_id === id);
  if (school) selectTsSchool(school);
}

/** Update page title, meta description, and URL to reflect the selected school. */
function updatePageMeta(school) {
  const recentYear = ALL_YEARS.slice().reverse().find(yr => (school.years?.[yr]?.app ?? 0) > 0);
  const rate = school.years?.[recentYear]?.admit_rate;
  const rateStr = rate != null ? ` — ${(rate * 100).toFixed(0)}% UC admit rate (${recentYear})` : '';
  const loc = [school.city, school.county].filter(Boolean).join(', ');

  const title = `${school.school_name}${loc ? ' (' + loc + ')' : ''} | UC Admissions | collegeacceptance.info`;
  const desc = `UC admissions data for ${school.school_name} in ${loc}${rateStr}. View applicant counts, admit rates, and enrollment trends from 1994–2024 across all UC campuses.`;

  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
  history.replaceState(null, '', '?school=' + encodeURIComponent(school.school_id));
}

// ════════════════════════════════════ TIME SERIES ═════════════════════════════

function setupTimeSeries() {
  setupAutocomplete('ts-school-input', 'ts-school-dropdown', selectTsSchool);
  document.getElementById('ts-campus').addEventListener('change', renderTsChart);
  document.getElementById('ts-ethnicity').addEventListener('change', renderTsChart);

  const def = allSchools.find(s =>
    s.school_type === 'CA Public' &&
    s.school_name.toUpperCase().includes('PALO ALTO') &&
    s.school_name.toUpperCase().includes('HIGH')
  ) ?? allSchools.find(s => s.school_type === 'CA Public') ?? allSchools[0];
  selectTsSchool(def);
}

function selectTsSchool(school) {
  if (!school) return;
  tsSelectedSchool = school;
  document.getElementById('ts-school-input').value = school.school_name;
  updatePageMeta(school);
  renderTsChart();
}

function renderTsChart() {
  const school    = tsSelectedSchool;
  const campus    = document.getElementById('ts-campus').value;
  const ethnicity = document.getElementById('ts-ethnicity').value;

  document.getElementById('ts-school-title').textContent = school?.school_name ?? '—';
  document.getElementById('ts-school-sub').textContent =
    school ? `${school.city}${school.county ? ', ' + school.county : ''}` +
             (school.school_type && school.school_type !== 'CA Public'
               ? ` · ${school.school_type}` : '')
           : '';

  if (!school) return;

  const appData  = [];
  const admRates = [];
  const yldRates = [];

  for (const yr of ALL_YEARS) {
    const d = getYearData(school.years?.[yr], campus, ethnicity);
    appData.push(d?.app ?? null);
    admRates.push(d?.admit_rate != null ? +(d.admit_rate * 100).toFixed(2) : null);
    const yl = yieldRate(d);
    yldRates.push(yl != null ? +(yl * 100).toFixed(2) : null);
  }

  const wrap    = document.getElementById('ts-chart').parentElement;
  const noDataEl = wrap.querySelector('.no-data-msg');
  if (tsChart) { tsChart.destroy(); tsChart = null; }

  if (!appData.some(v => v != null)) {
    document.getElementById('ts-chart').style.display = 'none';
    if (!noDataEl) {
      const el = Object.assign(document.createElement('div'), {
        className: 'no-data-msg', textContent: 'No data for this selection.',
      });
      wrap.appendChild(el);
    }
    return;
  }
  document.getElementById('ts-chart').style.display = '';
  noDataEl?.remove();

  tsChart = new Chart(document.getElementById('ts-chart').getContext('2d'), {
    data: {
      labels: ALL_YEARS,
      datasets: [
        {
          type: 'bar', label: 'Applicants', data: appData,
          backgroundColor: 'rgba(59,130,246,.38)',
          borderColor: 'rgba(59,130,246,.6)', borderWidth: 1,
          yAxisID: 'yApp', order: 2,
        },
        {
          type: 'line', label: 'Admit Rate', data: admRates,
          borderColor: '#dc2626', backgroundColor: 'transparent',
          borderWidth: 2.2, pointRadius: 2, pointHoverRadius: 5,
          tension: 0.3, spanGaps: true, yAxisID: 'yRate', order: 1,
        },
        {
          type: 'line', label: 'Yield Rate', data: yldRates,
          borderColor: '#16a34a', backgroundColor: 'transparent',
          borderWidth: 2.2, pointRadius: 2, pointHoverRadius: 5,
          tension: 0.3, spanGaps: true, yAxisID: 'yRate', order: 1,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = ctx.parsed.y;
              if (v == null) return null;
              return ctx.dataset.label === 'Applicants'
                ? `Applicants: ${Math.round(v).toLocaleString()}`
                : `${ctx.dataset.label}: ${v.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,.04)' },
          ticks: { maxRotation: 45, font: { size: 10 }, maxTicksLimit: 16 },
        },
        yApp: {
          type: 'linear', position: 'left', beginAtZero: true,
          title: { display: true, text: 'Applicants', font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,.06)' },
          ticks: { font: { size: 10 } },
        },
        yRate: {
          type: 'linear', position: 'right', beginAtZero: true, max: 100,
          title: { display: true, text: 'Rate (%)', font: { size: 10 } },
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 10 }, callback: v => v + '%' },
        },
      },
    },
  });
}

// ════════════════════════════════════ COMPARE ═════════════════════════════════

const MAX_CMP = 8;

function setupCompare() {
  setupAutocomplete('cmp-school-input', 'cmp-school-dropdown', addCmpSchool);
  document.getElementById('cmp-campus').addEventListener('change', renderCompareChart);
  document.getElementById('cmp-ethnicity').addEventListener('change', renderCompareChart);

  // Pre-load default comparison schools
  const cmpDefaults = [
    { q: 'PALO ALTO SENIOR HIGH', city: null },
    { q: 'LOWELL HIGH SCHOOL',    city: 'San Francisco' },
  ];
  for (const { q, city } of cmpDefaults) {
    const school = allSchools.find(s =>
      s.school_type === 'CA Public' &&
      s.school_name.toUpperCase().includes(q) &&
      (!city || s.city === city)
    );
    if (school) addCmpSchool(school);
  }
}

function addCmpSchool(school) {
  if (!school) return;
  const key = schoolKey(school);
  if (cmpSelectedSchools.some(s => schoolKey(s.school) === key)) return;
  if (cmpSelectedSchools.length >= MAX_CMP) return;
  cmpSelectedSchools.push({ school, colorIdx: cmpSelectedSchools.length });
  document.getElementById('cmp-school-input').value = '';
  renderCmpTags();
  renderCompareChart();
}

function removeCmpSchool(key) {
  cmpSelectedSchools = cmpSelectedSchools.filter(s => schoolKey(s.school) !== key);
  cmpSelectedSchools.forEach((s, i) => { s.colorIdx = i; });
  renderCmpTags();
  renderCompareChart();
}

function renderCmpTags() {
  const container = document.getElementById('cmp-tags');
  container.innerHTML = '';

  if (!cmpSelectedSchools.length) {
    container.innerHTML = '<span class="cmp-hint">Search above to add schools (up to 8)</span>';
    return;
  }

  for (const { school, colorIdx } of cmpSelectedSchools) {
    const color = CMP_COLORS[colorIdx];
    const key = schoolKey(school);
    const typeLabel = school.school_type && school.school_type !== 'CA Public'
      ? ` · ${school.school_type}` : '';
    const chip = document.createElement('div');
    chip.className = 'cmp-chip';
    chip.style.borderColor = color;
    chip.style.backgroundColor = color + '16';
    chip.innerHTML = `
      <span class="chip-dot" style="background:${color}"></span>
      <span class="chip-name" title="${school.school_name}">${school.school_name}</span>
      <span class="chip-city">${school.city}${typeLabel}</span>
      <button class="chip-remove" aria-label="Remove">×</button>`;
    chip.querySelector('.chip-remove').addEventListener('click', () => removeCmpSchool(key));
    container.appendChild(chip);
  }
}

function renderCompareChart() {
  const campus    = document.getElementById('cmp-campus').value;
  const ethnicity = document.getElementById('cmp-ethnicity').value;
  const canvas    = document.getElementById('cmp-chart');
  const wrap      = canvas.parentElement;
  const noDataEl  = wrap.querySelector('.no-data-msg');

  // Update subtitle
  const parts = [];
  if (campus !== 'universitywide') parts.push(campus);
  if (ethnicity !== 'all') parts.push(ethnicity);
  document.getElementById('cmp-sub').textContent =
    parts.length ? parts.join(' · ') : 'Universitywide · All students';

  if (cmpChart) { cmpChart.destroy(); cmpChart = null; }

  if (!cmpSelectedSchools.length) {
    canvas.style.display = 'none';
    if (!noDataEl) {
      const el = Object.assign(document.createElement('div'), {
        className: 'no-data-msg',
        textContent: 'Add schools above to compare admit rate trends.',
      });
      wrap.appendChild(el);
    }
    return;
  }
  canvas.style.display = '';
  noDataEl?.remove();

  const datasets = cmpSelectedSchools.map(({ school, colorIdx }) => {
    const color = CMP_COLORS[colorIdx];
    return {
      label: school.school_name,
      data: ALL_YEARS.map(yr => {
        const d = getYearData(school.years?.[yr], campus, ethnicity);
        return d?.admit_rate != null ? +(d.admit_rate * 100).toFixed(2) : null;
      }),
      borderColor: color,
      backgroundColor: color + '18',
      borderWidth: 2.2,
      pointRadius: 2.5, pointHoverRadius: 6,
      tension: 0.3, spanGaps: true, fill: false,
    };
  });

  cmpChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels: ALL_YEARS, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true, position: 'bottom',
          labels: { font: { size: 10 }, usePointStyle: true, padding: 12, boxWidth: 20 },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = ctx.parsed.y;
              if (v == null) return null;
              const name = ctx.dataset.label.length > 32
                ? ctx.dataset.label.slice(0, 29) + '…'
                : ctx.dataset.label;
              return `${name}: ${v.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,.04)' },
          ticks: { maxRotation: 45, font: { size: 10 }, maxTicksLimit: 16 },
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: 'Admit Rate (%)', font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,.06)' },
          ticks: { font: { size: 10 }, callback: v => v + '%' },
        },
      },
    },
  });
}

// ════════════════════════════════════ MAP ════════════════════════════════════

function setupMap() {
  // Year dropdown
  ALL_YEARS.slice().reverse().forEach(yr => {
    const opt = Object.assign(document.createElement('option'), {value: yr, textContent: yr});
    document.getElementById('map-year').appendChild(opt);
  });

  // County dropdown (CA schools only)
  allCounties.forEach(c => {
    const opt = Object.assign(document.createElement('option'), {value: c, textContent: c});
    document.getElementById('map-county').appendChild(opt);
  });

  document.getElementById('map-campus').addEventListener('change', updateMap);
  document.getElementById('map-year').addEventListener('change', updateMap);
  document.getElementById('map-county').addEventListener('change', () => {
    highlightCounty(document.getElementById('map-county').value);
    updateMap();
  });
  // Dropdown toggle (open/close)
  const dropBtn   = document.getElementById('map-school-type-btn');
  const dropPanel = document.getElementById('map-school-type-panel');
  dropBtn.addEventListener('click', () => dropPanel.classList.toggle('hidden'));
  document.addEventListener('click', e => {
    if (!document.getElementById('map-school-type').contains(e.target)) {
      dropPanel.classList.add('hidden');
    }
  });

  // Per-checkbox listeners for school type multi-select
  document.querySelectorAll('#map-school-type input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      // Auto-fly only when a single type is now selected
      const types = getSelectedSchoolTypes();
      if (types.length === 1 && cb.checked) {
        const view = TYPE_MAP_VIEW[types[0]] ?? TYPE_MAP_VIEW['CA Public'];
        if (map) map.setView(view.center, view.zoom, { animate: true, duration: 0.8 });
      }
      await handleMapTypeChange();
    });
  });

  // Map school "Find" search — fly to location
  setupAutocomplete('map-school-input', 'map-school-dropdown', async school => {
    // Ensure this school's type is checked and loaded
    const cb = document.querySelector(`#map-school-type input[value="${school.school_type}"]`);
    if (cb && !cb.checked) {
      cb.checked = true;
      await handleMapTypeChange();  // also calls updateTypeDropdownLabel
    }
    const coord = schoolCoords[schoolKey(school)];
    if (coord && map) {
      map.flyTo([coord.lat, coord.lng], 13, { duration: 0.8 });
      flashMarker(schoolKey(school));
    }
    document.getElementById('map-school-input').value = '';
  });
}

function initMap() {
  map = L.map('map', { center: [37.0, -119.5], zoom: 6 });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
      '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  updateMap();
}

function addCountyLayer(geojson) {
  if (countyLayer) { countyLayer.remove(); countyLayer = null; }
  countyLayer = L.geoJSON(geojson, {
    style: {
      color: '#6b7280', weight: 0.8, fillOpacity: 0, opacity: 0.5,
    },
    onEachFeature(feature, layer) {
      layer._countyName = feature.properties?.name ?? '';
    },
  }).addTo(map);
}

function highlightCounty(countyName) {
  if (!countyLayer) return;
  countyLayer.eachLayer(layer => {
    const match = countyName && layer._countyName?.toLowerCase() === countyName.toLowerCase();
    layer.setStyle({
      color: match ? var_uc_blue() : '#6b7280',
      weight: match ? 2.5 : 0.8,
      fillOpacity: match ? 0.06 : 0,
      opacity: match ? 1 : 0.5,
    });
    if (match) {
      layer.bringToFront();
      map?.flyToBounds(layer.getBounds(), { padding: [30, 30], duration: 0.6 });
    }
  });
}

function var_uc_blue() {
  return getComputedStyle(document.documentElement).getPropertyValue('--uc-blue').trim() || '#003262';
}

const admitColor = rate =>
  rate == null ? ADMIT_NONE :
  rate >= 0.75 ? ADMIT_HIGH :
  rate >= 0.50 ? ADMIT_MID  : ADMIT_LOW;

// Map for flashing markers: composite key → marker
const markerById = new Map();

function updateMap() {
  if (!map) return;

  const campus      = document.getElementById('map-campus').value;
  const year        = document.getElementById('map-year').value;
  const county      = document.getElementById('map-county').value;
  const schoolTypes = getSelectedSchoolTypes();

  mapMarkers.forEach(m => m.remove());
  mapMarkers = [];
  markerById.clear();

  // County outlines are only relevant for CA school types
  const caTypes = new Set(['CA Public', 'CA Private', 'Other']);
  const showCounty = schoolTypes.length === 0 || schoolTypes.some(t => caTypes.has(t));
  if (countyLayer) countyLayer.setStyle({ opacity: showCounty ? 0.5 : 0, fillOpacity: 0 });

  let count = 0;

  for (const school of allSchools) {
    // School type filter
    if (schoolTypes.length > 0 && !schoolTypes.includes(school.school_type)) continue;

    // Skip inactive schools (no applicants in the past 3 years)
    if (!RECENT_YEARS.some(yr => (school.years?.[yr]?.app ?? 0) > 0)) continue;

    const coord = schoolCoords[schoolKey(school)];
    if (!coord) continue;

    // County filter: only applies to CA school types
    if (county && (school.school_type === 'CA Public' || school.school_type === 'CA Private')) {
      if (school.county !== county) continue;
    }

    const yearObj = school.years?.[year];
    const d = getYearData(yearObj, campus, 'all');
    if (!d && campus !== 'universitywide') continue;

    const color = admitColor(d?.admit_rate ?? null);
    const marker = L.circleMarker([coord.lat, coord.lng], {
      radius: 6, fillColor: color,
      color: 'rgba(0,0,0,.28)', weight: 1, fillOpacity: 0.82,
    });

    const typeLabel = school.school_type && school.school_type !== 'CA Public'
      ? `<div class="tt-row"><span class="tt-label">Type</span><span class="tt-value">${school.school_type}</span></div>`
      : '';
    marker.bindTooltip(`
      <div class="map-tooltip">
        <div class="tt-name">${school.school_name}</div>
        <div class="tt-loc">${school.city}${school.county ? ', ' + school.county : ''}</div>
        ${typeLabel}
        <div class="tt-row"><span class="tt-label">Applicants</span><span class="tt-value">${fmt(d?.app)}</span></div>
        <div class="tt-row"><span class="tt-label">Admit Rate</span><span class="tt-value">${pct(d?.admit_rate)}</span></div>
        <div class="tt-row"><span class="tt-label">Yield Rate</span><span class="tt-value">${pct(yieldRate(d))}</span></div>
        <div class="tt-row"><span class="tt-label">Enrollees</span><span class="tt-value">${fmt(d?.enr)}</span></div>
      </div>`, { sticky: true, opacity: 1, className: '' });

    // Click: show school in time series + add to compare
    marker.on('click', () => {
      selectTsSchool(school);
      addCmpSchool(school);
      // Scroll up to charts on mobile
      if (window.innerWidth < 900) {
        document.querySelector('.charts-row')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    const key = schoolKey(school);
    marker.addTo(map);
    mapMarkers.push(marker);
    markerById.set(key, marker);
    count++;
  }

  const el = document.getElementById('map-school-count');
  if (el) el.textContent = `${count.toLocaleString()} schools`;
}

// Flash a marker briefly to highlight it after "Find School" search
function flashMarker(key) {
  const marker = markerById.get(key);
  if (!marker) return;
  let flashes = 0;
  const origOpts = { ...marker.options };
  const interval = setInterval(() => {
    const highlighted = flashes % 2 === 0;
    marker.setStyle({
      fillColor: highlighted ? '#fff' : origOpts.fillColor,
      radius:    highlighted ? 10    : origOpts.radius ?? 6,
    });
    if (++flashes >= 6) {
      clearInterval(interval);
      marker.setStyle({ fillColor: origOpts.fillColor, radius: origOpts.radius ?? 6 });
    }
  }, 250);
}

// ─── Shared School Autocomplete ───────────────────────────────────────────────

function setupAutocomplete(inputId, dropdownId, onSelect) {
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  let activeIdx  = -1;

  const show = items => {
    dropdown.innerHTML = '';
    if (!items.length) { dropdown.classList.add('hidden'); return; }
    items.forEach(s => {
      const li = document.createElement('li');
      const typeLabel = s.school_type && s.school_type !== 'CA Public'
        ? ` · ${s.school_type}` : '';
      li.innerHTML =
        `<span class="dd-name">${s.school_name}</span>` +
        `<span class="dd-loc">${s.city}${s.county ? ', ' + s.county : ''}${typeLabel}</span>`;
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        onSelect(s);
        dropdown.classList.add('hidden');
      });
      dropdown.appendChild(li);
    });
    activeIdx = -1;
    dropdown.classList.remove('hidden');
  };

  const close = () => { dropdown.classList.add('hidden'); activeIdx = -1; };

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    const hits = allSchools
      .filter(s => s.school_name.toLowerCase().includes(q))
      .sort((a, b) => {
        const ai = a.school_name.toLowerCase().indexOf(q);
        const bi = b.school_name.toLowerCase().indexOf(q);
        return ai - bi || a.school_name.localeCompare(b.school_name);
      })
      .slice(0, 12);
    show(hits);
  });

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      items[activeIdx].dispatchEvent(new MouseEvent('mousedown'));
      return;
    } else if (e.key === 'Escape') {
      close(); return;
    } else { return; }
    items.forEach((li, i) => li.classList.toggle('active', i === activeIdx));
  });

  input.addEventListener('blur', () => setTimeout(close, 160));
}

// ─── Start ────────────────────────────────────────────────────────────────────

loadData().catch(err => {
  console.error('Load error:', err);
  document.getElementById('loading-msg').textContent = 'Failed to load data. ' + err.message;
});
