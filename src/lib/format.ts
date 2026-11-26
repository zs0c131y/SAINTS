const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export const pad2 = (n: number | string) => String(n).padStart(2, '0');
export const isHttp = (u?: string | null): u is string => /^https?:\/\//i.test(u ?? '');

/** The sheet writes dates as M/D/YYYY; anything else falls back to Date parsing. */
export function parseDate(s?: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s ?? '');
  if (m) return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  const d = new Date(s ?? '');
  return Number.isNaN(d.getTime()) ? null : d;
}

export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function formatRange(a: string, b?: string): string {
  const s = parseDate(a);
  const e = b ? parseDate(b) : null;
  if (!s) return a;
  if (!e || +e === +s) return fmtDate(s);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${s.getDate()}–${fmtDate(e)}`;
  return `${fmtDate(s)} – ${fmtDate(e)}`;
}

/** "USD 50" / "$50" stay dollars; plain numbers (and ₹/Rs/INR) are rupees. */
export function money(v: string | undefined, fallback: string): string {
  if (v === '' || v == null) return fallback;
  const s = String(v).trim();
  const usd = s.match(/^(?:USD|US\$|\$)\s*([\d,]+(?:\.\d+)?)$/i) ?? s.match(/^([\d,]+(?:\.\d+)?)\s*(?:USD|\$)$/i);
  if (usd?.[1]) {
    const u = Number(usd[1].replace(/,/g, ''));
    if (!Number.isNaN(u)) return 'USD ' + u.toLocaleString('en-US');
  }
  const n = Number(s.replace(/^(?:₹|Rs\.?|INR)\s*/i, '').replace(/,/g, ''));
  return Number.isNaN(n) ? v : '₹' + n.toLocaleString('en-IN');
}

export function numberWord(n: number, capital = false): string {
  const w = n < WORDS.length ? WORDS[n]! : String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

/** Sheet images are often multi-MB originals; Cloudinary can resize on the fly. */
export function sized(url: string, w: number): string {
  return /\/image\/upload\//.test(url) ? url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${w}/`) : url;
}

export function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const list = out.get(k);
    if (list) list.push(it); else out.set(k, [it]);
  }
  return out;
}
