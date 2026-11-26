import 'server-only';
import { cache } from 'react';
import { parseCSV } from './csv';
import snapshot from '@/data/snapshot.json';

/**
 * The Google Sheet is the CMS. Each tab is read as CSV on the server and cached by Next.js
 * (ISR, SHEET_REVALIDATE_SECONDS). If Google is unreachable the shipped snapshot
 * (src/data/snapshot.json, written by `npm run snapshot`) is used, so a page never renders empty.
 */
export const SHEET_ID = process.env.SHEET_ID || '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
export const REVALIDATE = Number(process.env.SHEET_REVALIDATE_SECONDS) || 60;
const TIMEOUT_MS = 8000;

/** First column each tab must start with. gviz silently returns the first tab when a name doesn't exist. */
export const EXPECT = {
  site_options: 'option_id', important_dates: 'imp_date_id', tracks: 'track_id', speakers: 'speaker_id',
  schedule: 'schedule_id', gallery_images: 'image_id', welcome_messages: 'welcome_message_id',
  organizing_committee: 'member_id', places_to_visit: 'ptv_id', faqs: 'faq_id',
  registration_fee: 'reg_fee_id', registration_steps: 'reg_step_id',
} as const;

export type TabName = keyof typeof EXPECT;
export type Row = Record<string, string>;
export interface Tab { missing: boolean; rows: Row[] }

/** Turn gviz CSV into rows. Tabs with a *_status column only keep status = "active". */
export function toTab(name: TabName, csv: string): Tab {
  const grid = parseCSV(csv);
  const head = (grid[0] ?? []).map((h) => h.trim());
  if (head[0] !== EXPECT[name]) return { missing: true, rows: [] };

  let rows = grid.slice(1)
    .map((r) => {
      const o: Row = {};
      head.forEach((h, i) => { if (h) o[h] = (r[i] ?? '').trim(); });
      return o;
    })
    .filter((o) => Object.values(o).some((v) => v !== ''));

  const statusKey = head.find((k) => /_status$/.test(k));
  if (statusKey) rows = rows.filter((r) => (r[statusKey] ?? '').toLowerCase() === 'active');
  return { missing: false, rows };
}

function fromSnapshot(name: TabName): Tab {
  const t = (snapshot as unknown as Record<string, Tab | undefined>)[name];
  return t ? { missing: !!t.missing, rows: t.rows } : { missing: true, rows: [] };
}

async function fetchTab(name: TabName): Promise<Tab> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE, tags: ['sheet', `sheet:${name}`] },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return toTab(name, await res.text());
  } catch (err) {
    console.warn(`[sheet] ${name}: ${(err as Error).message}; using the shipped snapshot`);
    return fromSnapshot(name);
  }
}

/** One fetch per tab per request. */
export const getTab = cache(fetchTab);
