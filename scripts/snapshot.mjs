/* Writes src/data/snapshot.json: a copy of the Google Sheet as it is right now.
   The site falls back to this copy when Google can't be reached (and at build time in CI),
   so a page never renders empty.

   Run `npm run snapshot` after the sheet changes in a way that matters (dates, tracks,
   speakers), then commit the updated file. Needs Node 18+. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHEET_ID = process.env.SHEET_ID || '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
// Keep in step with EXPECT in src/lib/sheet.ts
const EXPECT = {
  site_options: 'option_id', important_dates: 'imp_date_id', tracks: 'track_id', speakers: 'speaker_id',
  schedule: 'schedule_id', gallery_images: 'image_id', welcome_messages: 'welcome_message_id',
  organizing_committee: 'member_id', places_to_visit: 'ptv_id', faqs: 'faq_id',
  registration_fee: 'reg_fee_id', registration_steps: 'reg_step_id',
};

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function fetchTab(name) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const grid = parseCSV(await res.text());
  const head = (grid[0] || []).map((h) => h.trim());
  if (head[0] !== EXPECT[name]) return { missing: true, rows: [] };
  let rows = grid.slice(1)
    .map((r) => { const o = {}; head.forEach((h, i) => { if (h) o[h] = (r[i] || '').trim(); }); return o; })
    .filter((o) => Object.values(o).some((v) => v !== ''));
  const statusKey = head.find((k) => /_status$/.test(k));
  if (statusKey) rows = rows.filter((r) => (r[statusKey] || '').toLowerCase() === 'active');
  return { missing: false, rows };
}

const out = {};
for (const name of Object.keys(EXPECT)) {
  const tab = await fetchTab(name);
  out[name] = { t: Date.now(), missing: tab.missing, rows: tab.rows };
  console.log(name.padEnd(22), tab.missing ? 'no such tab' : `${tab.rows.length} rows`);
}
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'snapshot.json');
fs.writeFileSync(file, JSON.stringify(out));
console.log('wrote', path.relative(process.cwd(), file));
