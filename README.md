# Carmelina Santoro Designs — website

A fast, static, hand-coded site (HTML / CSS / vanilla JS). No WordPress, no framework,
no build step required to *view* a page — you can open any `.html` file directly and edit it.

## Run it locally

Any static server works. Simplest:

```bash
python3 -m http.server 8787
```

Then open http://localhost:8787/ . (You can also just double-click `index.html`, but a
server is recommended so paths and fonts behave exactly like production.)

## Editing content

- **Page text** — open the page's `.html` file and edit between the `<!-- EDIT: ... -->` markers. No build needed.
- **Projects** — everything about the 7 projects lives in one file: [`data/projects.json`](data/projects.json).
  Add, remove, reorder, or edit a project there, then run the build (below) to regenerate the homepage grid.
- **Header / nav / footer / shared head** — authored ONCE in [`/partials/`](partials/). Edit there, then run the build.
- **Images** — in [`assets/images/`](assets/images/). Swap any file for a higher-res version using the **same filename**
  and nothing else needs to change. Old-URL → filename mapping is in [`assets/images/IMAGE-MAP.md`](assets/images/IMAGE-MAP.md).
- **Résumé / CV** — `assets/resume.pdf` (currently Carmelina's real resume recap; replace anytime).

## The build step (only when you touch a partial or projects.json)

```bash
node scripts/build.js
```

This stamps the shared partials into every page and regenerates the project grid from
`projects.json`. Pages stay fully standalone and directly editable afterward — the build
just keeps the repeated chrome in sync. **You never need it for ordinary content edits.**

How it works: pages contain marker pairs like
`<!-- @partial:header --> … <!-- @endpartial -->` and `<!-- @projects:grid --> … <!-- @endprojects -->`.
The script replaces what's between them. `{{base}}` in a partial becomes the right relative
path for each page automatically.

## Structure

```
index.html              Homepage
projects/               One page per case study (coming next)
about.html              Studio / About (coming next)
services.html           Services (coming next)
contact.html            Contact (coming next)
assets/
  images/               Images + IMAGE-MAP.md
  css/site.css          All styling + design tokens (palette/type at the top)
  js/site.js            Mobile nav + scroll reveals (site works without JS)
  resume.pdf            CV download
data/projects.json      Single source of truth for projects
partials/               Shared head / header / footer (edit once)
scripts/build.js        Partial + grid sync (no dependencies)
```

## Design tokens

Palette and type are defined at the top of [`assets/css/site.css`](assets/css/site.css):
sand `#FAF8F4`, ink `#1A1A1A`, accent deep ink-blue `#2B3A4A`; Fraunces (display) + Instrument Sans (body).

## Open TODOs (facts to supply — never invented)

- Real contact email + phone + studio address (currently clearly-marked `PLACEHOLDER`).
- Decide the contact-form method (Formspree / Netlify Forms / direct mailto) — see the brief §9.
- Per-project year / size / services, and full case-study narratives (marked `TODO` in `projects.json`).
- 2–3 real named client testimonials + press/awards (homepage currently uses Carmelina's own quote, not a fake testimonial).
- Self-host fonts for the performance target (currently Google Fonts with preconnect + `display=swap`).
