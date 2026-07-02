# IST 5930 — Embodied AI Systems · Class Website

Interactive class website for **CSUSB IST 5930 (Fall 2026)** — a 15-week course
building intelligent humanoid robots on the Unitree G1. Dark technical theme,
animated learning modules, plain-language key terms, fun facts, videos with
auto-thumbnails, and an instructor admin panel.

**Stack:** static HTML/CSS/JS · Cloudflare Pages + Pages Functions · R2 (documents) · KV (events & video links)

## Editing content (the modular part)

| What you want to change | Where |
|---|---|
| Week titles, key terms, fun facts, "why it matters", labs, arc notes | [`public/content/course.json`](public/content/course.json) — one JSON file drives the whole site |
| Course narrative / outcomes / tracks / grading | same file, `course` section |
| Colors, fonts, animations | [`public/css/site.css`](public/css/site.css) (design tokens at the top) |
| Slides/documents, video links, current events | **No code needed** — use `/admin.html` on the live site |

Every change to `course.json` re-renders the homepage, all 15 week pages, the
journey arc, and the module rows automatically.

## Instructor admin panel

Open `/admin.html` on the deployed site, paste the admin key (stored once per
device). From there:

- **Upload slides/documents** per week (pptx, pdf, docx, xlsx, zip… → stored in R2, listed instantly on the week page)
- **Add video links** — YouTube/Vimeo thumbnails are generated automatically
- **Post current events** to the homepage "Robotics Right Now" section

The key lives as the `ADMIN_KEY` secret on the Pages project. Rotate it with:

```
wrangler pages secret put ADMIN_KEY --project-name ist5930-robotics
```

## Local development

```
npx wrangler pages dev
```

Uses local simulations of KV/R2. Put a local key in `.dev.vars`:
`ADMIN_KEY=dev-key`

## Deploy

Pushing to `main` is optional — deploys are CLI-driven:

```
npx wrangler pages deploy
```

## Structure

```
public/            static site (Pages output dir)
  content/course.json   ← all curriculum content
  index.html / week.html / admin.html
  css/site.css          ← theme + vault FX (glass, tilt, sheen, reveals)
  js/app.js · week.js · admin.js · shared.js
functions/api/     Pages Functions (upload → R2, videos/events → KV)
wrangler.jsonc     bindings: DOCS (R2), DYNAMIC (KV)
```
