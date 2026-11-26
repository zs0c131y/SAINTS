/* ============================================================
   SAINTS 2027 — Backend loader
   File: assets/js/backend.js

   The Google Sheet is the backend. Each tab is read as CSV and
   rendered into the page. Fresh data is always preferred: tabs are
   re-read on load, every POLL_MS while the page is visible, and when
   the browser tab regains focus. A section is only re-drawn when its
   data changed, so an edit in the sheet shows up without reloading.

   The page never waits for Google to show something. On load it paints
   from the newest copy it already has: the last good fetch kept in
   localStorage, or assets/js/snapshot.js (written by `npm run snapshot`; only downloaded when
   this browser has no saved copy yet).
   Live data then replaces it. If Google can't be reached (offline,
   throttled, timeout) that copy stays on screen and polling backs off.

   Rules
   - Tabs with a *_status column only show rows where status = "active".
   - `footer_right_text` is ignored (the footer credit stays as written in the HTML).
   - Plain values are inserted as text; the few cells that hold HTML
     (messages, steps, FAQ answers) go through sanitize() first.
   - Dates in the page are bound to rows of `important_dates` by title,
     e.g. <span data-date="Abstract Deadline">.
   - Tracks come from a `tracks` tab (track_id, track_title, track_theme,
     track_status). Until that tab exists, TRACKS_FALLBACK is used.
   ============================================================ */
(function () {
  'use strict';

  // URL of the shipped snapshot (from data-snapshot on this script tag). It is only fetched when
  // this browser has no saved copy yet, so returning visitors never download it.
  const SNAPSHOT_URL = document.currentScript && document.currentScript.dataset.snapshot;

  const SHEET_ID = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
  const POLL_MS  = 60000;      // while the page is visible
  const MIN_GAP  = 10000;      // never refetch more often than this (focus/visibility events)
  const MAX_POLL = 300000;     // backoff ceiling when Google keeps failing
  const TIMEOUT  = 8000;       // give up on a request after this long
  const IGNORED_OPTIONS = ['footer_right_text'];

  // First column each tab must start with. gviz silently returns the first tab
  // when a tab name doesn't exist, so this is how we detect a missing tab.
  const EXPECT = {
    site_options: 'option_id', important_dates: 'imp_date_id', tracks: 'track_id', speakers: 'speaker_id',
    schedule: 'schedule_id', gallery_images: 'image_id', welcome_messages: 'welcome_message_id',
    organizing_committee: 'member_id', places_to_visit: 'ptv_id', faqs: 'faq_id',
    registration_fee: 'reg_fee_id', registration_steps: 'reg_step_id',
  };

  // Used only while the `tracks` tab doesn't exist yet.
  const TRACKS_FALLBACK = [
    { id: '1', title: 'Track 1', theme: 'Materials for Advanced Applications' },
    { id: '2', title: 'Track 2', theme: 'Frontier in Life Sciences, Climate Change & Sustainable Technologies' },
    { id: '3', title: 'Track 3', theme: 'Scalable Mathematical & Statistical Solutions Through Modelling, Analysis and Computation' },
    { id: '4', title: 'Track 4', theme: 'From Innovation to Implementation: Advancing Next Generation Technologies' },
  ];

  /* ── CSV ───────────────────────────────────────────────── */
  function parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
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

  /* ── Fetch (never cached) ──────────────────────────────── */
  async function fetchTab(name) {
    const url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&sheet=' +
      encodeURIComponent(name) + '&_=' + Date.now();
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), TIMEOUT);
    let res;
    try { res = await fetch(url, { cache: 'no-store', signal: ctl.signal }); } finally { clearTimeout(timer); }
    if (!res.ok) throw new Error(name + ': HTTP ' + res.status);
    const grid = parseCSV(await res.text());
    const head = (grid[0] || []).map(h => h.trim());
    if (head[0] !== EXPECT[name]) return { missing: true, rows: [] };      // tab doesn't exist (yet)

    let rows = grid.slice(1)
      .map(r => { const o = {}; head.forEach((h, i) => { if (h) o[h] = (r[i] || '').trim(); }); return o; })
      .filter(o => Object.values(o).some(v => v !== ''));
    const statusKey = head.find(k => /_status$/.test(k));
    if (statusKey) rows = rows.filter(r => (r[statusKey] || '').toLowerCase() === 'active');
    return { missing: false, rows };
  }

  /* ── Last good copy (used only when the live fetch fails) ── */
  function saveCopy(name, t) {
    try { localStorage.setItem('saints:' + name, JSON.stringify({ t: Date.now(), missing: t.missing, rows: t.rows })); } catch (e) { /* storage full or blocked */ }
  }
  function loadCopy(name) {
    try { return JSON.parse(localStorage.getItem('saints:' + name) || 'null'); } catch (e) { return null; }
  }

  /* ── Helpers ───────────────────────────────────────────── */
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  const isHttp = u => /^https?:\/\//i.test(u || '');

  // Sheet images are often full-size originals (several MB). Cloudinary can resize and
  // compress on the fly, so ask for the size we actually display.
  function sized(url, w) {
    return /\/image\/upload\//.test(url)
      ? url.replace('/image/upload/', '/image/upload/f_auto,q_auto,c_limit,w_' + w + '/')
      : url;
  }
  function photo(url, w, alt) {
    const img = document.createElement('img');
    img.src = sized(url, w); img.alt = alt || ''; img.loading = 'lazy'; img.decoding = 'async';
    return img;
  }
  const pad2 = n => String(n).padStart(2, '0');

  // Allow only a small set of inline tags; links must be http(s).
  const ALLOWED = { A: 1, STRONG: 1, B: 1, EM: 1, I: 1, BR: 1, U: 1 };
  function sanitize(html) {
    const doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    (function walk(node) {
      Array.from(node.childNodes).forEach(ch => {
        if (ch.nodeType === 8) { ch.remove(); return; }
        if (ch.nodeType !== 1) return;
        if (!ALLOWED[ch.tagName]) { ch.replaceWith(...Array.from(ch.childNodes)); return; }
        Array.from(ch.attributes).forEach(a => {
          const keep = ch.tagName === 'A' && (a.name === 'href' || a.name === 'target');
          if (!keep) ch.removeAttribute(a.name);
        });
        if (ch.tagName === 'A') {
          if (!isHttp(ch.getAttribute('href'))) ch.removeAttribute('href');
          ch.setAttribute('target', '_blank'); ch.setAttribute('rel', 'noopener');
          ch.classList.add('inline-link');
        }
        walk(ch);
      });
    })(doc.body);
    return doc.body.innerHTML;
  }
  const richText = s => sanitize(s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function parseDate(s) {
    let m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s || '');          // M/D/YYYY (the sheet's format)
    if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  const fmt = d => d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  function formatRange(a, b) {
    const s = parseDate(a), e = b ? parseDate(b) : null;
    if (!s) return a;
    if (!e || +e === +s) return fmt(s);
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return s.getDate() + '–' + fmt(e);
    return fmt(s) + ' – ' + fmt(e);
  }
  const money = (v, fallback) => {
    if (v === '' || v == null) return fallback;
    const s = String(v).trim();
    // Foreign amounts: "USD 50", "$50", "US$ 1,200" -> "USD 50" / "USD 1,200"
    const usd = s.match(/^(?:USD|US\$|\$)\s*([\d,]+(?:\.\d+)?)$/i) || s.match(/^([\d,]+(?:\.\d+)?)\s*(?:USD|\$)$/i);
    if (usd) { const u = Number(usd[1].replace(/,/g, '')); if (!isNaN(u)) return 'USD ' + u.toLocaleString('en-US'); }
    // Plain numbers (and ₹/Rs/INR-prefixed) are rupees
    const n = Number(s.replace(/^(?:₹|Rs\.?|INR)\s*/i, '').replace(/,/g, ''));
    return isNaN(n) ? v : '₹' + n.toLocaleString('en-IN');
  };
  const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];

  function reveal(node) {
    $$('[data-reveal]', node).forEach(n => n.classList.add('is-in'));
    if (node.hasAttribute && node.hasAttribute('data-reveal')) node.classList.add('is-in');
  }
  function show(section) {
    if (!section) return;
    section.hidden = false;
    $$('[data-needs="' + section.id + '"]').forEach(a => { a.hidden = false; });
  }

  // Show the first `limit` children; a button reveals the rest.
  function collapsible(box, limit) {
    const old = box.nextElementSibling;
    if (old && old.classList.contains('more-wrap')) old.remove();
    const kids = Array.from(box.children);
    if (kids.length <= limit) return;
    let open = false;
    const apply = () => kids.forEach((k, i) => { k.hidden = !open && i >= limit; });
    const btn = el('button', 'btn btn-ghost', ''); btn.type = 'button';
    const label = () => { btn.textContent = open ? 'Show fewer' : 'Show all ' + kids.length; };
    btn.addEventListener('click', () => { open = !open; apply(); label(); });
    const wrap = el('div', 'more-wrap'); wrap.appendChild(btn);
    box.insertAdjacentElement('afterend', wrap);
    apply(); label();
  }

  /* ── Data ──────────────────────────────────────────────── */
  const D = {};                       // tab name → rows (kept from the last good fetch)
  let OPT = {};

  const dateRow = title => (D.important_dates || []).find(r => r.imp_date_title.toLowerCase() === String(title).toLowerCase());
  function confRange() {
    const r = dateRow('Conference Dates');
    if (!r) return null;
    const s = parseDate(r.imp_date_start_display); const e = parseDate(r.imp_date_end_display) || s;
    return s ? { start: s, end: e } : null;
  }

  function getTracks() {
    let list;
    if (D.tracks && D.tracks.length) {
      list = D.tracks.map(r => ({ id: r.track_id, title: r.track_title || 'Track ' + r.track_id, theme: r.track_theme || '' }));
    } else if (D.tracks_missing) {
      list = TRACKS_FALLBACK.slice();
    } else {
      list = [];
    }
    const spk = D.speakers || [];
    list.forEach(t => { t.count = spk.filter(s => s.speaker_track === t.id).length; });
    return list.sort((a, b) => Number(a.id) - Number(b.id));
  }

  /* ── Renderers ─────────────────────────────────────────── */

  // site_options → meta tags, favicons, logos, footer text
  function applySiteOptions() {
    const o = {};
    (D.site_options || []).forEach(r => { if (IGNORED_OPTIONS.indexOf(r.option_key) < 0) o[r.option_key] = r.option_value; });
    OPT = o;
    const fill = s => (s || '').replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));
    const real = v => v && !/^YOUR_|will be updated/i.test(v);

    const meta = (attr, name, value) => {
      if (!real(value)) return;
      let m = $('meta[' + attr + '="' + name + '"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.appendChild(m); }
      m.setAttribute('content', value);
    };
    const link = (rel, value, extra) => {
      if (!isHttp(value)) return;
      let l = $('link[rel="' + rel + '"]' + (extra && extra.sizes ? '[sizes="' + extra.sizes + '"]' : ''));
      if (!l) { l = document.createElement('link'); l.rel = rel; if (extra && extra.sizes) l.sizes = extra.sizes; document.head.appendChild(l); }
      l.href = value; if (extra && extra.type) l.type = extra.type;
    };

    // Inner pages carry their own title/description/social tags in the HTML; the sheet's
    // site-wide values apply to the home page only.
    const own = document.body.hasAttribute('data-own-meta');
    if (!own) {
      if (real(o.seo_title)) document.title = fill(o.seo_title);
      meta('name', 'description', o.seo_description);
      meta('name', 'keywords', o.seo_keywords);
      meta('name', 'robots', o.seo_robots);
      meta('property', 'og:title', fill(o.og_title));
      meta('property', 'og:description', fill(o.og_description));
      meta('property', 'og:type', o.og_type);
      meta('property', 'og:site_name', o.og_site_name);
      meta('property', 'og:locale', o.og_locale);
      if (isHttp(o.og_image)) meta('property', 'og:image', o.og_image);
      meta('name', 'twitter:card', o.twitter_card);
      meta('name', 'twitter:title', fill(o.twitter_title));
      meta('name', 'twitter:description', fill(o.twitter_description));
      if (isHttp(o.twitter_image)) meta('name', 'twitter:image', o.twitter_image);
      meta('name', 'twitter:site', o.twitter_site);
      meta('name', 'twitter:creator', o.twitter_creator);
      if (isHttp(o.canonical_url)) link('canonical', o.canonical_url);
    }
    meta('name', 'author', o.seo_author);
    meta('name', 'google-site-verification', o.google_site_verification);
    meta('name', 'msvalidate.01', o.bing_site_verification);
    link('icon', o.favicon);
    link('icon', o.favicon_16x16, { sizes: '16x16', type: 'image/png' });
    link('icon', o.favicon_32x32, { sizes: '32x32', type: 'image/png' });
    link('apple-touch-icon', o.apple_touch_icon);
    link('manifest', o.favicon_manifest);

    $$('[data-site-img]').forEach(img => {
      const v = o[img.dataset.siteImg];
      if (isHttp(v)) { img.src = sized(v, +img.dataset.imgW || 840); if (o.site_fullname) img.alt = o.site_fullname; }
    });
    $$('[data-site-text]').forEach(n => {
      const v = o[n.dataset.siteText];
      if (v) n.innerHTML = sanitize(fill(v));
    });
  }

  // important_dates → timeline, inline date bindings, day cards, countdown
  function renderDates() {
    const rows = D.important_dates || [];
    const now = new Date(); now.setHours(0, 0, 0, 0);

    // inline bindings: <span data-date="Abstract Deadline">
    $$('[data-date]').forEach(n => {
      const r = dateRow(n.dataset.date);
      if (r) n.textContent = formatRange(r.imp_date_start_display, r.imp_date_end_display);
    });

    // schedule day cards follow the conference range
    const conf = confRange();
    if (conf) {
      const days = Math.round((conf.end - conf.start) / 864e5) + 1;
      $$('[data-day]').forEach(n => {
        const k = Number(n.dataset.day);
        const d = new Date(conf.start); d.setDate(d.getDate() + k - 1);
        n.textContent = fmt(d);
        const card = n.closest('[data-day-card]'); if (card) card.hidden = k > days;
      });
      const cd = $('#countdown');
      if (cd) cd.dataset.target = conf.start.getFullYear() + '-' + pad2(conf.start.getMonth() + 1) + '-' + pad2(conf.start.getDate()) + 'T09:00:00+05:30';
    }

    // timeline
    const box = $('[data-sheet="important_dates"]');
    if (!box || !rows.length) return;
    const items = rows.map(r => {
      const s = parseDate(r.imp_date_start_display);
      return { r, s, e: parseDate(r.imp_date_end_display) || s };
    }).filter(x => x.s).sort((a, b) => a.s - b.s);
    const nextIdx = items.findIndex(x => x.e >= now);

    box.innerHTML = '';
    items.forEach((x, i) => {
      const li = el('li', 'tl-item' + (x.e < now ? ' is-past' : '') + (i === nextIdx ? ' is-next' : '') +
        (/conference dates/i.test(x.r.imp_date_title) ? ' tl-key' : ''));
      li.setAttribute('data-reveal', '');
      li.appendChild(el('span', 'tl-node'));
      const card = el('div', 'tl-card');
      const title = el('h3', 'tl-title', x.r.imp_date_title);
      if (i === nextIdx) title.appendChild(el('span', 'tl-badge', 'Next'));
      card.append(el('p', 'tl-date', formatRange(x.r.imp_date_start_display, x.r.imp_date_end_display)), title);
      li.appendChild(card); box.appendChild(li);
    });
    reveal(box); show(box.closest('section'));
  }

  // tracks → home tiles, nav menus, counts
  function renderTracks() {
    const tracks = getTracks();
    const n = tracks.length;
    const speakers = (D.speakers || []).length;
    if (speakers) $$('[data-speaker-count]').forEach(s => { s.textContent = speakers; });
    $$('[data-track-count]').forEach(s => {
      if (!n) return;
      const w = n < WORDS.length ? WORDS[n] : String(n);
      s.textContent = s.dataset.trackCount === 'cap' ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    });

    $$('[data-tracks-menu]').forEach(ul => {
      if (!n) return;
      ul.innerHTML = '';
      const mobile = ul.dataset.tracksMenu === 'mobile';
      tracks.forEach(t => {
        const li = el('li'); const a = el('a'); a.href = '/track?track=' + encodeURIComponent(t.id);
        if (mobile) { a.className = 'm-sublink'; a.textContent = t.title + (t.theme ? ': ' + t.theme : ''); }
        else {
          a.className = 'dropdown-link';
          const num = el('span', 'track-num', t.id);
          const txt = el('span', 'dd-text'); txt.appendChild(el('b', null, t.title));
          if (t.theme) txt.appendChild(el('small', null, t.theme));
          const arr = el('i', 'fa-solid fa-arrow-right dd-arrow');
          a.append(num, txt, arr);
        }
        li.appendChild(a); ul.appendChild(li);
      });
    });

    const grid = $('[data-sheet="tracks"]');
    if (!grid || !n) return;
    grid.innerHTML = '';
    tracks.forEach((t, i) => {
      const a = el('a', 'track'); a.href = '/track?track=' + encodeURIComponent(t.id);
      a.setAttribute('data-reveal', ''); a.style.setProperty('--d', i * 80 + 'ms');
      a.appendChild(el('span', 'track-no', pad2(Number(t.id) || t.id)));
      a.appendChild(el('h3', null, t.title));
      if (t.theme) a.appendChild(el('p', null, t.theme));
      const foot = el('span', 'track-go', 'View track ');
      foot.appendChild(el('i', 'fa-solid fa-arrow-right'));
      a.appendChild(foot);
      grid.appendChild(a);
    });
    reveal(grid); show(grid.closest('section'));
  }

  // /track?track=N → speakers + schedule for that track
  // Filled head-and-shoulders, cropped at the bottom edge like a portrait.
  function avatar() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 88 88'); svg.setAttribute('class', 'speaker-avatar'); svg.setAttribute('aria-hidden', 'true');
    const head = document.createElementNS(NS, 'circle');
    head.setAttribute('cx', '44'); head.setAttribute('cy', '35'); head.setAttribute('r', '16');
    const body = document.createElementNS(NS, 'path');
    body.setAttribute('d', 'M8 92c0-21 16-35 36-35s36 14 36 35z');
    svg.append(head, body);
    return svg;
  }
  function speakerCard(s) {
    const card = el('article', 'speaker');
    const ph = el('div', 'speaker-photo');
    const placeholder = () => { ph.classList.add('no-photo'); ph.textContent = ''; ph.appendChild(avatar()); };
    if (isHttp(s.speaker_image)) { const img = photo(s.speaker_image, 160, s.speaker_fullname); img.onerror = placeholder; ph.appendChild(img); }
    else placeholder();
    const txt = el('div', 'speaker-text');
    txt.append(el('h4', 'speaker-name', s.speaker_fullname), el('p', 'speaker-aff', s.speaker_affiliation));
    card.append(ph, txt);
    return card;
  }
  function renderTrackPage() {
    const tracks = getTracks();
    if (!tracks.length) return;
    const wanted = new URLSearchParams(location.search).get('track') || (location.hash.match(/track-(\w+)/) || [])[1];
    const t = tracks.find(x => x.id === wanted) || (wanted ? null : tracks[0]);
    const set = (k, v) => $$('[data-tp="' + k + '"]').forEach(n => { n.textContent = v; });
    const page = $('[data-track-page]');

    if (!t) { set('title', 'Track not found'); set('theme', ''); $$('[data-tp-section]').forEach(s => { s.hidden = true; }); return; }
    set('title', t.title); set('theme', t.theme); set('crumb', t.title);
    document.title = t.title + (t.theme ? ': ' + t.theme : '') + ' | ' + (OPT.site_fullname || 'SAINTS 2027');
    // each track is its own indexable page: give it its own canonical URL and social/search text
    const url = 'https://saints.christuniversity.in/track?track=' + encodeURIComponent(t.id);
    const desc = t.title + (t.theme ? ': ' + t.theme + '. ' : '. ') + 'Speakers and schedule for this ' + (OPT.site_fullname || 'SAINTS 2027') + ' track.';
    const setHead = (sel, make, attr, val) => { let n = $(sel); if (!n) { n = make(); document.head.appendChild(n); } n.setAttribute(attr, val); };
    const mk = (tag, a, v) => () => { const n = document.createElement(tag); n.setAttribute(a, v); return n; };
    setHead('link[rel="canonical"]', mk('link', 'rel', 'canonical'), 'href', url);
    setHead('meta[name="description"]', mk('meta', 'name', 'description'), 'content', desc);
    setHead('meta[property="og:title"]', mk('meta', 'property', 'og:title'), 'content', document.title);
    setHead('meta[property="og:description"]', mk('meta', 'property', 'og:description'), 'content', desc);
    setHead('meta[property="og:url"]', mk('meta', 'property', 'og:url'), 'content', url);

    // speakers, grouped by category (sheet order)
    const sbox = $('[data-tp="speakers"]');
    const spk = (D.speakers || []).filter(s => s.speaker_track === t.id);
    sbox.innerHTML = '';
    const groups = new Map();
    spk.forEach(s => { const k = s.speaker_category || ''; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); });
    groups.forEach((list, cat) => {
      const g = el('div', 'cm-group');
      if (cat) g.appendChild(el('h3', 'cm-role', cat));
      const grid = el('div', 'speaker-grid'); list.forEach(s => grid.appendChild(speakerCard(s)));
      g.appendChild(grid); sbox.appendChild(g);
    });
    const sec = $('[data-tp-section="speakers"]'); if (sec) sec.hidden = !spk.length;

    // schedule embeds for this track
    const embeds = (D.schedule || []).filter(r => r.schedule_for_track === t.id && isHttp(r.schedule_embed_url));
    const schBox = $('[data-tp="schedule"]');
    schBox.innerHTML = '';
    embeds.forEach(r => {
      const f = el('iframe'); f.src = r.schedule_embed_url; f.loading = 'lazy'; f.title = 'Schedule, ' + t.title;
      const wrap = el('div', 'schedule-embed'); wrap.appendChild(f); schBox.appendChild(wrap);
    });
    const ssec = $('[data-tp-section="schedule"]'); if (ssec) ssec.hidden = !embeds.length;

    // other tracks
    const obox = $('[data-tp="others"]'); obox.innerHTML = '';
    tracks.filter(x => x.id !== t.id).forEach(x => {
      const a = el('a', 'track'); a.href = '/track?track=' + encodeURIComponent(x.id);
      a.appendChild(el('span', 'track-no', pad2(Number(x.id) || x.id)));
      a.appendChild(el('h3', null, x.title));
      if (x.theme) a.appendChild(el('p', null, x.theme));
      const foot = el('span', 'track-go', 'View track '); foot.appendChild(el('i', 'fa-solid fa-arrow-right')); a.appendChild(foot);
      obox.appendChild(a);
    });
    if (page) page.hidden = false;
  }

  // gallery_images
  function renderGallery() {
    const box = $('[data-sheet="gallery_images"]');
    const items = (D.gallery_images || []).filter(r => isHttp(r.image_url));
    if (!box || !items.length) return;
    box.innerHTML = '';
    items.forEach(r => {
      const fig = el('figure', 'gal');
      fig.append(photo(r.image_url, 900, r.image_title));
      if (r.image_title) fig.appendChild(el('figcaption', null, r.image_title));
      box.appendChild(fig);
    });
    reveal(box); show(box.closest('section'));
  }

  // welcome_messages (long text is clamped on the page; a button opens it)
  function renderWelcome() {
    const box = $('[data-sheet="welcome_messages"]');
    const rows = D.welcome_messages || [];
    if (!box || !rows.length) return;
    box.innerHTML = '';
    rows.forEach((r, i) => {
      const card = el('article', 'msg'); card.setAttribute('data-reveal', ''); card.style.setProperty('--d', i * 100 + 'ms');
      const body = el('div', 'msg-body is-clamped'); body.innerHTML = sanitize(r.welcome_message_text);
      const more = el('button', 'msg-more', 'Read full message'); more.type = 'button';
      more.addEventListener('click', () => {
        const open = body.classList.toggle('is-clamped') === false;
        more.textContent = open ? 'Show less' : 'Read full message';
      });
      const by = el('footer', 'msg-by');
      if (isHttp(r.welcome_message_image)) {
        by.appendChild(photo(r.welcome_message_image, 160, r.welcome_message_by));
      }
      const who = el('div'); who.append(el('p', 'msg-name', r.welcome_message_by));
      const sub = [r.welcome_message_role, r.welcome_message_designation, r.welcome_message_institute].filter(Boolean).join(' · ');
      who.appendChild(el('p', 'msg-role', sub));
      by.appendChild(who); card.append(body, more, by); box.appendChild(card);
    });
    reveal(box); show(box.closest('section'));
  }

  // organizing_committee (/committee) — grouped by role in sheet order
  function renderCommittee() {
    const box = $('[data-sheet="organizing_committee"]');
    const rows = D.organizing_committee || [];
    if (!box || !rows.length) return;
    box.innerHTML = '';
    const groups = new Map();
    rows.forEach(r => { const k = r.member_role || ''; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
    groups.forEach((members, role) => {
      const g = el('div', 'cm-group'); g.setAttribute('data-reveal', '');
      if (role) g.appendChild(el('h3', 'cm-role', role));
      const ul = el('ul', 'cm-list');
      members.forEach(m => {
        const li = el('li', 'cm-member');
        if (isHttp(m.member_image)) li.appendChild(photo(m.member_image, 160, m.member_fullname));
        const t = el('div'); t.appendChild(el('p', 'cm-name', m.member_fullname));
        if (m.member_designation) t.appendChild(el('p', 'cm-desig', m.member_designation));
        li.appendChild(t); ul.appendChild(li);
      });
      g.appendChild(ul); box.appendChild(g);
    });
    reveal(box); show(box.closest('section'));
  }

  // places_to_visit (first few; button shows the rest)
  function renderPlaces() {
    const box = $('[data-sheet="places_to_visit"]');
    const rows = D.places_to_visit || [];
    if (!box || !rows.length) return;
    box.innerHTML = '';
    rows.forEach((r, i) => {
      const a = el(isHttp(r.ptv_link) ? 'a' : 'div', 'place');
      if (isHttp(r.ptv_link)) { a.href = r.ptv_link; a.target = '_blank'; a.rel = 'noopener'; }
      a.setAttribute('data-reveal', ''); a.style.setProperty('--d', (i % 4) * 70 + 'ms');
      if (isHttp(r.ptv_image)) a.appendChild(photo(r.ptv_image, 640, ''));
      const cap = el('div', 'place-cap'); cap.appendChild(el('h3', null, r.ptv_title));
      if (r.ptv_desc) cap.appendChild(el('p', null, r.ptv_desc));
      a.appendChild(cap); box.appendChild(a);
    });
    reveal(box); collapsible(box, 4); show(box.closest('section'));
  }

  // faqs (rows without a question are skipped)
  function renderFaqs() {
    const box = $('[data-sheet="faqs"]');
    const items = (D.faqs || []).filter(r => r.faq_question);
    if (!box || !items.length) return;
    box.innerHTML = '';
    items.forEach(r => {
      const d = el('details', 'faq'); d.setAttribute('data-reveal', '');
      d.appendChild(el('summary', null, r.faq_question));
      const a = el('div', 'faq-a'); a.innerHTML = richText(r.faq_answer); d.appendChild(a);
      box.appendChild(d);
    });
    reveal(box); show(box.closest('section'));
  }

  // registration_fee
  function renderFees() {
    const box = $('[data-sheet="registration_fee"]');
    const rows = D.registration_fee || [];
    if (!box || !rows.length) return;
    box.innerHTML = '';
    rows.forEach((r, i) => {
      const f = el('div', 'fee'); f.setAttribute('data-reveal', ''); f.style.setProperty('--d', (i % 4) * 70 + 'ms');
      f.appendChild(el('h3', null, r.reg_category));
      const dl = el('dl');
      [['Early bird', r.reg_fee_early_bird], ['Regular', r.reg_fee_regular]].forEach(([k, v]) => {
        const row = el('div'); row.append(el('dt', null, k), el('dd', null, money(v, 'TBA'))); dl.appendChild(row);
      });
      f.appendChild(dl); box.appendChild(f);
    });
    reveal(box);
  }

  // registration_steps
  function renderSteps() {
    const box = $('[data-sheet="registration_steps"]');
    const rows = D.registration_steps || [];
    if (!box || !rows.length) return;
    box.innerHTML = '';
    rows.forEach((r, i) => {
      const li = el('li', 'step'); li.setAttribute('data-reveal', '');
      li.appendChild(el('span', 'step-n', String(i + 1)));
      const body = el('div', 'step-body');
      const t = el('p', 'step-title'); t.innerHTML = sanitize(r.reg_step_title); body.appendChild(t);
      if (r.reg_step_description) { const d = el('p', 'step-desc'); d.innerHTML = sanitize(r.reg_step_description); body.appendChild(d); }
      if (isHttp(r.reg_step_screenshot)) {
        const img = photo(r.reg_step_screenshot, 900, 'Step ' + (i + 1) + ' screenshot'); img.className = 'step-shot'; body.appendChild(img);
      }
      li.appendChild(body); box.appendChild(li);
    });
    reveal(box); show(box.closest('section'));
  }

  /* ── Registry: which tabs a renderer needs, and when it applies ── */
  const RENDERERS = [
    { tabs: ['site_options'],                 when: () => true,                                                           run: applySiteOptions },
    { tabs: ['important_dates'],              when: () => $('[data-sheet="important_dates"],[data-date],[data-day],#countdown'), run: renderDates },
    { tabs: ['tracks', 'speakers'],           when: () => $('[data-tracks-menu],[data-sheet="tracks"],[data-track-count]'), run: renderTracks },
    { tabs: ['tracks', 'speakers', 'schedule'], when: () => $('[data-track-page]'),                                       run: renderTrackPage },
    { tabs: ['gallery_images'],               when: () => $('[data-sheet="gallery_images"]'),                             run: renderGallery },
    { tabs: ['welcome_messages'],             when: () => $('[data-sheet="welcome_messages"]'),                           run: renderWelcome },
    { tabs: ['organizing_committee'],         when: () => $('[data-sheet="organizing_committee"]'),                       run: renderCommittee },
    { tabs: ['places_to_visit'],              when: () => $('[data-sheet="places_to_visit"]'),                            run: renderPlaces },
    { tabs: ['faqs'],                         when: () => $('[data-sheet="faqs"]'),                                       run: renderFaqs },
    { tabs: ['registration_fee'],             when: () => $('[data-sheet="registration_fee"]'),                           run: renderFees },
    { tabs: ['registration_steps'],           when: () => $('[data-sheet="registration_steps"]'),                         run: renderSteps },
  ];
  // Dates also drive the day cards / countdown, which can render before dates load; tracks needs speakers for counts.

  /* ── Loading placeholders (replaced by real content, or removed if nothing loads) ── */
  function skeletons() {
    const tl = $('[data-sheet="important_dates"]');
    if (tl && !tl.children.length) {
      for (let i = 0; i < 3; i++) {
        const li = el('li', 'tl-item sk'); li.appendChild(el('span', 'tl-node'));
        li.appendChild(el('div', 'tl-card sk-card')); tl.appendChild(li);
      }
      tl.closest('section').hidden = false;
    }
    const tr = $('[data-sheet="tracks"]');
    if (tr && !tr.children.length) {
      for (let i = 0; i < 4; i++) tr.appendChild(el('div', 'track sk sk-card'));
      tr.closest('section').hidden = false;
    }
  }
  // Anything still showing a placeholder after a refresh got no data: remove it and hide its section.
  function settleSkeletons() {
    const boxes = new Set();
    $$('.sk').forEach(n => { if (n.parentNode) boxes.add(n.parentNode); });
    boxes.forEach(box => {
      while (box.firstChild) box.removeChild(box.firstChild);
      const sec = box.closest('section'); if (sec) sec.hidden = true;
    });
  }

  /* ── Refresh loop ──────────────────────────────────────── */
  const lastSig = new Map();
  let busy = false, lastRun = 0, failures = 0, timer = null;

  function apply(name, t) {
    if (name === 'tracks') D.tracks_missing = t.missing;
    D[name] = t.rows;
  }

  // Run every renderer whose data is present and has changed since it last ran.
  function render(active) {
    active.forEach(r => {
      if (r.tabs.some(n => D[n] === undefined)) return;               // nothing live and nothing saved
      const sig = r.tabs.map(n => JSON.stringify(D[n])).join('|') + (r.tabs.indexOf('tracks') >= 0 ? D.tracks_missing : '');
      if (lastSig.get(r) === sig) return;
      lastSig.set(r, sig);
      try { r.run(); } catch (e) { console.warn('[backend]', e); }
    });
  }

  // First paint: the newer of the saved copy and the shipped snapshot, before any network.
  function paintFromCopies() {
    const snap = window.SAINTS_SNAPSHOT || {};
    const active = RENDERERS.filter(r => r.when());
    Array.from(new Set(active.flatMap(r => r.tabs))).forEach(n => {
      const a = loadCopy(n), b = snap[n];
      const c = a && b ? (a.t >= b.t ? a : b) : (a || b);
      if (c && Array.isArray(c.rows)) apply(n, c);
    });
    render(active);
  }

  async function refresh(force) {
    if (busy || (!force && Date.now() - lastRun < MIN_GAP)) return;
    busy = true; lastRun = Date.now();
    let ok = 0, bad = 0;
    try {
      const active = RENDERERS.filter(r => r.when());
      const names = Array.from(new Set(active.flatMap(r => r.tabs)));
      await Promise.all(names.map(async n => {
        try {
          const t = await fetchTab(n); apply(n, t); saveCopy(n, t); ok++;
        } catch (err) {
          bad++; console.warn('[backend]', err.name === 'AbortError' ? n + ': timed out' : err.message);
          if (D[n] === undefined) { const c = loadCopy(n); if (c) apply(n, c); }   // show the saved copy
        }
      }));
      render(active);
      settleSkeletons();
    } finally { busy = false; }
    failures = ok === 0 && bad > 0 ? failures + 1 : 0;
  }

  function schedule() {
    clearTimeout(timer);
    const delay = Math.min(MAX_POLL, POLL_MS * Math.pow(2, failures));   // back off while Google is failing
    timer = setTimeout(async () => {
      if (!document.hidden) await refresh(true);
      schedule();
    }, delay);
  }

  function loadSnapshot() {
    const names = Array.from(new Set(RENDERERS.filter(r => r.when()).flatMap(r => r.tabs)));
    if (!SNAPSHOT_URL || names.every(n => loadCopy(n))) return Promise.resolve();
    return new Promise(done => {
      const s = document.createElement('script');
      s.src = SNAPSHOT_URL; s.onload = s.onerror = () => done();
      document.head.appendChild(s);
    });
  }

  async function boot() {
    ['https://res.cloudinary.com', 'https://docs.google.com'].forEach(h => {
      const l = document.createElement('link'); l.rel = 'preconnect'; l.href = h; l.crossOrigin = ''; document.head.appendChild(l);
    });
    await loadSnapshot();
    paintFromCopies();
    skeletons();                       // only for sections that still have nothing to show
    refresh(true).then(schedule);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(false); });
    window.addEventListener('focus', () => refresh(false));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
