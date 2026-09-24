# Image map — old URL → local file

All images downloaded from the legacy WordPress site and renamed with clean, SEO-friendly
filenames. To get full resolution, the `-770x433` / `-700x433` crop suffix was stripped from
each URL; **every image resolved at full res on the first try — no sized fallbacks were needed.**

Replace any of these with a higher-res version later by dropping a new file at the same path
and keeping the same filename — no HTML/JSON edits required.

Base URL for all originals: `https://www.carmelinasantoro.com/wp-content/uploads/`

| Local file (`/assets/images/`) | Downloaded dimensions | Original URL path | Notes |
|---|---|---|---|
| `logo-light.jpg` | 196×100 | `2017/01/CSDlogo-light.jpg` | Light logo (for dark backgrounds). Low-res — replace with SVG/PNG ideally. |
| `logo-dark.jpg` | 196×100 | `2017/01/CSDlogo-dark.jpg` | Dark logo (for light backgrounds). Low-res — replace with SVG/PNG ideally. |
| `about-hero.jpg` | 770×433 | `2016/02/about-2.jpg` | About page hero. Only 770×433 available — **low-res, swap when possible.** |
| `carmelina-portrait.jpg` | 1177×1452 | `2017/01/Screenshot_2016-03-17-13-09-59-1.jpg` | Portrait of Carmelina. Good res. |
| `carlton-hotel-south-beach.jpg` | 2340×1316 | `2016/11/Carlton-1.jpg` | The Carlton Hotel. Full res ✔ |
| `lt-restaurant-miami-beach.jpg` | 2340×1316 | `2016/09/lt-restaurant-1.jpg` | LT Restaurant. Full res ✔ |
| `laluna-resort-grenada.jpg` | 2340×1316 | `2016/09/la-luna-1.jpg` | Laluna Resort. Full res ✔ |
| `laluna-villa-01.jpg` … `-05.jpg` | up to 1671px | client folder `lalunavilla/` | Laluna Villa gallery (01 = hero/card). Optimized from source PNGs. |
| `betsy-hotel-south-beach.jpg` | 2340×1316 | `2016/08/betsy-1.jpg` | The Betsy Hotel. Full res ✔ |
| `tribeca-loft-new-york.jpg` | 700×467 | `2016/08/Vandertol-Northmore11.jpg` | Tribeca Loft. **Low-res, swap when possible.** |
| `ermenegildo-zegna-retail.jpg` | 800×534 | `2016/07/zegna-1.jpg` | Ermenegildo Zegna retail. Mid-res, swap when possible. |

## Placeholders
None. All 11 images downloaded successfully — no broken images, no placeholders in use.

## To swap in higher-res later
1. Export the new image at the same aspect ratio (16:9 works for project heroes/cards).
2. Save it over the existing file with the **exact same filename** in this folder.
3. Done — every page and `data/projects.json` reference the file by name, so nothing else changes.
