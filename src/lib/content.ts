import 'server-only';
import { cache } from 'react';
import { getTab, type Row } from './sheet';
import { formatRange, isHttp, parseDate } from './format';

/* ── Site options ─────────────────────────────────────────── */

const IGNORED_OPTIONS = new Set(['footer_right_text']);

export type Options = Record<string, string>;

export const getOptions = cache(async (): Promise<Options> => {
  const { rows } = await getTab('site_options');
  const o: Options = {};
  for (const r of rows) {
    const key = r.option_key;
    if (key && !IGNORED_OPTIONS.has(key)) o[key] = r.option_value ?? '';
  }
  return o;
});

/** Replace {placeholders} in a sheet value with other options. */
export const fillOptions = (s: string | undefined, o: Options) =>
  (s ?? '').replace(/\{(\w+)\}/g, (m, k: string) => o[k] ?? m);

/** Placeholder values in the sheet ("YOUR_...", "will be updated") are not real. */
export const realValue = (v: string | undefined): v is string => !!v && !/^YOUR_|will be updated/i.test(v);

/* ── Important dates ──────────────────────────────────────── */

export const getDates = cache(async (): Promise<Row[]> => (await getTab('important_dates')).rows);

const findDate = (rows: Row[], title: string) =>
  rows.find((r) => (r.imp_date_title ?? '').toLowerCase() === title.toLowerCase());

/** Display text for a named date, e.g. dateText('Abstract Deadline', '25 November 2026'). */
export async function dateText(title: string, fallback: string): Promise<string> {
  const r = findDate(await getDates(), title);
  return r ? formatRange(r.imp_date_start_display ?? '', r.imp_date_end_display) : fallback;
}

export interface ConferenceRange { start: Date; end: Date }

export async function getConferenceRange(): Promise<ConferenceRange | null> {
  const r = findDate(await getDates(), 'Conference Dates');
  if (!r) return null;
  const start = parseDate(r.imp_date_start_display);
  const end = parseDate(r.imp_date_end_display) ?? start;
  return start && end ? { start, end } : null;
}

export interface TimelineItem { title: string; text: string; isPast: boolean; isNext: boolean; isKey: boolean }

export async function getTimeline(now = new Date()): Promise<TimelineItem[]> {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const items = (await getDates())
    .map((r) => {
      const s = parseDate(r.imp_date_start_display);
      return { r, s, e: parseDate(r.imp_date_end_display) ?? s };
    })
    .filter((x): x is { r: Row; s: Date; e: Date } => !!x.s && !!x.e)
    .sort((a, b) => +a.s - +b.s);
  const nextIdx = items.findIndex((x) => x.e >= today);
  return items.map((x, i) => ({
    title: x.r.imp_date_title ?? '',
    text: formatRange(x.r.imp_date_start_display ?? '', x.r.imp_date_end_display),
    isPast: x.e < today,
    isNext: i === nextIdx,
    isKey: /conference dates/i.test(x.r.imp_date_title ?? ''),
  }));
}

/* ── Tracks and speakers ──────────────────────────────────── */

export interface Track { id: string; title: string; theme: string; count: number }

/** Used only while the `tracks` tab doesn't exist in the sheet. */
const TRACKS_FALLBACK = [
  { id: '1', title: 'Track 1', theme: 'Materials for Advanced Applications' },
  { id: '2', title: 'Track 2', theme: 'Frontier in Life Sciences, Climate Change & Sustainable Technologies' },
  { id: '3', title: 'Track 3', theme: 'Scalable Mathematical & Statistical Solutions Through Modelling, Analysis and Computation' },
  { id: '4', title: 'Track 4', theme: 'From Innovation to Implementation: Advancing Next Generation Technologies' },
];

export const getSpeakers = cache(async (): Promise<Row[]> => (await getTab('speakers')).rows);

export const getTracks = cache(async (): Promise<Track[]> => {
  const [tab, speakers] = await Promise.all([getTab('tracks'), getSpeakers()]);
  const base = tab.rows.length
    ? tab.rows.map((r) => ({ id: r.track_id ?? '', title: r.track_title || `Track ${r.track_id}`, theme: r.track_theme ?? '' }))
    : tab.missing ? TRACKS_FALLBACK : [];
  return base
    .map((t) => ({ ...t, count: speakers.filter((s) => s.speaker_track === t.id).length }))
    .sort((a, b) => Number(a.id) - Number(b.id));
});

export const getTrack = async (id: string) => (await getTracks()).find((t) => t.id === id);

export async function getTrackSpeakers(id: string): Promise<Row[]> {
  return (await getSpeakers()).filter((s) => s.speaker_track === id);
}

export async function getTrackSchedules(id: string): Promise<Row[]> {
  const { rows } = await getTab('schedule');
  return rows.filter((r) => r.schedule_for_track === id && isHttp(r.schedule_embed_url));
}

/* ── Other tabs ───────────────────────────────────────────── */

export const getGallery = async () => (await getTab('gallery_images')).rows.filter((r) => isHttp(r.image_url));
export const getWelcomeMessages = async () => (await getTab('welcome_messages')).rows;
export const getCommittee = async () => (await getTab('organizing_committee')).rows;
export const getPlaces = async () => (await getTab('places_to_visit')).rows;
export const getFaqs = async () => (await getTab('faqs')).rows.filter((r) => r.faq_question);
export const getFees = async () => (await getTab('registration_fee')).rows;
export const getSteps = async () => (await getTab('registration_steps')).rows;
