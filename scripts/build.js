#!/usr/bin/env node
/* ============================================================================
   CSD tiny build — syncs shared partials into every standalone HTML page.
   NO framework, NO dependencies. Node 14+ only.

   How it works:
   - Shared chrome lives in /partials/{head,header,footer}.html
   - Each page marks where a partial goes with:
        <!-- @partial:header -->  ...anything...  <!-- @endpartial -->
   - Running `node scripts/build.js` replaces the ...anything... with the
     current partial contents, so the pages stay 100% standalone & directly
     editable, but the nav/head/footer are authored in ONE place.
   - `{{base}}` inside a partial becomes the correct relative prefix per page
     (""" for root pages, "../" for /projects/*), so links work on file:// too.

   Run it ONLY when you change a partial. Editing page content never needs it.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PARTIALS_DIR = path.join(ROOT, "partials");
const PROJECTS_JSON = path.join(ROOT, "data", "projects.json");

/* Directories (relative to ROOT) whose *.html files get processed. */
const PAGE_DIRS = ["", "projects"];

/* Load partials: name -> raw html (comments in the partial file are stripped
   only if they are the leading "instructions" comment we add for editors). */
function loadPartials() {
  const map = {};
  for (const file of fs.readdirSync(PARTIALS_DIR)) {
    if (!file.endsWith(".html")) continue;
    const name = path.basename(file, ".html");
    let html = fs.readFileSync(path.join(PARTIALS_DIR, file), "utf8").trim();
    map[name] = html;
  }
  return map;
}

/* relative prefix from a page back to site root, e.g. projects/x.html -> "../" */
function baseFor(relPath) {
  const depth = relPath.split(path.sep).length - 1;
  return depth === 0 ? "" : "../".repeat(depth);
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Homepage gallery filters. `id` = the project's `category` field in
   data/projects.json; the button ids double as deep-link anchors the nav
   submenu targets (/#residential etc.), applied by site.js on load. */
const GALLERY_FILTERS = [
  { id: "all",         label: "All" },
  { id: "residential", label: "Residential" },
  { id: "hospitality", label: "Hospitality" },
  { id: "retail",      label: "Retail" }
];

function renderGalleryTile(p, base) {
  /* image can be a local filename (assets/images/…) or an absolute URL
     (hotlinked to the live site) — use it as-is when it's absolute. */
  const imgSrc = /^https?:\/\//.test(p.image) ? esc(p.image) : `${base}assets/images/${esc(p.image)}`;
  /* hideFromAll: tile is kept out of the 'All' view but still shows under its
     category filter. It ships with `hidden` so the default 'All' view (and the
     no-JS fallback) never show it; site.js reveals it when Retail is active. */
  const hideAllAttr = p.hideFromAll ? ` data-hide-all="true" hidden` : "";
  return [
    `    <a class="gallery-tile reveal" href="/projects/${esc(p.slug)}" data-category="${esc(p.category || "")}"${hideAllAttr} aria-label="${esc(p.title)}">`,
    `      <img class="gallery-tile__img" src="${imgSrc}" alt="${esc(p.alt)}" loading="lazy">`,
    `      <span class="gallery-tile__overlay" aria-hidden="true"><span class="gallery-tile__title">${esc(p.title)}</span></span>`,
    `    </a>`
  ].join("\n");
}

/* Build the filterable packed gallery from data/projects.json. Emits a
   centered filter bar + a masonry gallery of tiles, each carrying a
   data-category attribute that site.js uses for client-side filtering. */
function renderProjectGrid(base) {
  const data = JSON.parse(fs.readFileSync(PROJECTS_JSON, "utf8"));
  /* Fixed manual order: tiles render in exactly the order they appear in
     data/projects.json (the "All" view is a curated sequence, not an
     auto-mix). Reorder projects there to change the homepage grid order. */
  const items = data.projects.slice();

  const filters = GALLERY_FILTERS.map(function (f) {
    const active = f.id === "all";
    const idAttr = f.id === "all" ? "" : ` id="${f.id}"`;
    return `    <button class="gallery-filter__btn${active ? " is-active" : ""}" type="button" data-filter="${f.id}"${idAttr} aria-pressed="${active ? "true" : "false"}">${esc(f.label)}</button>`;
  }).join("\n");

  const tiles = items.map(function (p) { return renderGalleryTile(p, base); }).join("\n");

  return [
    `<div class="project-gallery-wrap">`,
    `  <div class="gallery-filter reveal" role="group" aria-label="Filter projects by category">`,
    filters,
    `  </div>`,
    `  <div class="gallery" id="project-gallery">`,
    tiles,
    `  </div>`,
    `</div>`
  ].join("\n");
}

function processFile(absPath, relPath, partials) {
  let html = fs.readFileSync(absPath, "utf8");
  const base = baseFor(relPath);
  let changed = false;

  /* project grid marker: <!-- @projects:grid --> ... <!-- @endprojects --> */
  const gridRe = /(<!--\s*@projects:grid\s*-->)([\s\S]*?)(<!--\s*@endprojects\s*-->)/g;
  if (gridRe.test(html)) {
    const grid = renderProjectGrid(base);
    html = html.replace(gridRe, (_m, open, _mid, close) => {
      changed = true;
      return `${open}\n${grid}\n${close}`;
    });
  }

  for (const [name, partialRaw] of Object.entries(partials)) {
    const re = new RegExp(
      `(<!--\\s*@partial:${name}\\s*-->)([\\s\\S]*?)(<!--\\s*@endpartial\\s*-->)`,
      "g"
    );
    if (!re.test(html)) continue;
    const filled = partialRaw.replace(/\{\{base\}\}/g, base);
    html = html.replace(re, (_m, open, _mid, close) => {
      changed = true;
      return `${open}\n${filled}\n${close}`;
    });
  }

  if (changed) {
    fs.writeFileSync(absPath, html, "utf8");
    console.log("  updated  " + relPath);
  } else {
    console.log("  (no markers) " + relPath);
  }
}

function main() {
  const partials = loadPartials();
  console.log("Partials loaded: " + Object.keys(partials).join(", "));
  let count = 0;
  for (const dir of PAGE_DIRS) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) continue;
    for (const file of fs.readdirSync(absDir)) {
      if (!file.endsWith(".html")) continue;
      const relPath = dir ? path.join(dir, file) : file;
      processFile(path.join(absDir, file), relPath, partials);
      count++;
    }
  }
  console.log(`Done. Processed ${count} page(s).`);
}

main();
