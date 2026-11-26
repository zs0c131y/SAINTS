# SAINTS 2027

Website for the **International Conference on Scientific Advances in Natural & Technological Sciences**,
hosted by the School of Sciences at CHRIST (Deemed to be University), Bangalore.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**. Content is edited in a **Google Sheet**; the
site reads it on the server and refreshes it every 60 seconds, so organisers never touch code for dates,
speakers, committee, fees and so on.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Node 20.9+ (22 recommended). Copy `.env.example` to `.env.local` to override settings; the defaults work as-is.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run check` | Lint, typecheck, tests and build (what CI runs) |
| `npm run snapshot` | Refresh `src/data/snapshot.json` from the sheet |

## Where things live

```
src/app/
  layout.tsx            Root layout: fonts, global CSS, GTM, site-wide metadata
  (site)/               Everything with the header + footer
    page.tsx              Home
    abstract/ registration/ committee/ track/[id]/
  not-found.tsx         Standalone 404 page
  api/health            Liveness probe
  api/revalidate        Optional: refresh the cache right after a sheet edit
  sitemap.ts robots.ts
src/components/         Header (client), Footer, hero, speaker cards, partners, splash, ...
src/lib/
  sheet.ts              Fetches a sheet tab (cached 60 s, falls back to the snapshot)
  content.ts            Typed getters: tracks, dates, speakers, ...
  format.ts sanitize.ts csv.ts speakers.ts seo.ts site.ts
src/data/
  snapshot.json         Copy of the sheet, used if Google is unreachable
  partners.ts           Partner / journal / industry logos (static)
src/styles/             main.css (design), fa-subset.css (icons), fonts.css, extras.css
public/assets/          Images, fonts, downloads (served at /assets/...)
```

## Content: the Google Sheet

Tabs (first column must keep its name, it is how a missing tab is detected):
`site_options`, `important_dates`, `tracks`, `speakers`, `schedule`, `gallery_images`, `welcome_messages`,
`organizing_committee`, `places_to_visit`, `faqs`, `registration_fee`, `registration_steps`.

- Tabs with a `*_status` column only show rows where it is `active`.
- Dates are `M/D/YYYY`. Named dates (`Abstract Deadline`, `Conference Dates`, ...) feed the timeline, the
  countdown and every date mentioned in the copy.
- If the `tracks` tab does not exist the four default tracks are used.
- Cells that may contain formatting (messages, steps, FAQ answers) allow only `<a> <b> <strong> <i> <em> <u> <br>`;
  anything else is stripped on the server.
- Pages are statically generated and revalidated every `SHEET_REVALIDATE_SECONDS` (60). To show an edit
  immediately, set `REVALIDATE_SECRET` and call `POST /api/revalidate` with header `x-revalidate-secret`.
- If Google is down the last shipped snapshot is used. Run `npm run snapshot` and commit after big sheet changes.

### Speaker photos

A photo URL in the sheet is used first. If it is empty or fails to load, a photo from
`public/assets/images/speakers/` is used (matched by surname in `src/lib/site.ts`), then a placeholder icon.

## Routes

`/`, `/abstract`, `/registration`, `/committee`, `/track/[id]`. Old URLs redirect: `/track?track=3` to `/track/3`,
and `*.html` to the clean path.

## Deployment (Fly.io)

```bash
fly deploy
fly secrets set REVALIDATE_SECRET=<random string>   # optional
```

The `Dockerfile` builds a standalone Next.js server (non-root user, port 8080); `fly.toml` health-checks
`/api/health`. Any Node host or container platform works the same way.

## Environment

See `.env.example`: `NEXT_PUBLIC_SITE_URL`, `SHEET_ID`, `SHEET_REVALIDATE_SECONDS`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_GTM_ID`.

## Notes for contributors

- Tailwind utilities load after `main.css` (as they did on the static site), so they win ties.
- Icons are a CSS-mask subset of Font Awesome. Add a rule to `src/styles/fa-subset.css` for any new icon.
- Sheet images come from arbitrary hosts, so they use a plain `<img>` (`SheetImg`); local images use `next/image`.
- The header's collapse-on-scroll lives in `src/components/Header.tsx` and relies on `#hero` / `#page-hero` ids.
