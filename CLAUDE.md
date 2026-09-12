# Corica Pastries website concepts

Home page design concepts for Corica Pastries, a Perth (Northbridge) Italian/continental
patisserie established 1957 by Giuseppe Corica. Current live site: https://www.coricapastries.com.au/

## The brief

- Nearly 70 years of history. Be respectful of it. Nothing too bold.
- "Traditional, but a modern quality take on traditional."
- The logo is NOT changing. Logo colours: deep green `#004d3f`, gold `#fadf3e`, cream, small red accents.
- Home page only for now. The owners will pick a direction from the options, then other pages follow.
- Keep copy factual. Do not invent history, awards, family names or product claims. The only
  established facts: est. 1957 by Giuseppe Corica, 106 Aberdeen Street Northbridge WA 6003,
  (08) 9328 8196, hours Mon–Fri 8am–5:30pm / Sat 8am–3pm / Sun & public holidays closed
  (hours were taken from the current site and are unconfirmed).

## Layout

```
index.html                 Gallery page listing all concepts (the site's home page)
assets/img/                Shared photography and logos pulled from the current site
assets/thumbs/NN.jpg       1152x720 screenshots of each concept, used by the gallery
options/NN-name/index.html One self-contained concept per folder (inline CSS + JS)
options/06-warm-continental/   Supplied by a third party as bare HTML; css/, js/ and
                               images/gallery/ were written here to make it render.
                               Do NOT edit its index.html; it is kept byte-identical.
vercel.json                Static hosting config (cleanUrls, trailingSlash, noindex header)
.claude/launch.json        Local static server config (python http.server on 8765)
```

Concepts 01–05 reference shared images as `../../assets/img/<name>`. Concept 06 uses its own
`css/`, `js/`, `images/` folders plus a few remote images from the live Corica site.

| # | Folder | Direction | Fonts |
|---|---|---|---|
| 1 | 01-heritage | Centred, symmetrical, green/cream/gold hairlines, 1957 seal | Cormorant Garamond, EB Garamond |
| 2 | 02-editorial | Warm paper, magazine layout, numbered index of ranges | Libre Caslon, Figtree |
| 3 | 03-shopfront | Awning stripe, photo cards, menu board, hours and map | Lora, Karla |
| 4 | 04-boutique | Deep green throughout, gold, arched frames | Marcellus, Mulish |
| 5 | 05-modern | Near-white, photo mosaic, large Bodoni headline | Bodoni Moda, Work Sans |
| 6 | 06-warm-continental | Supplied HTML; cream/olive/terracotta, dark hero | Playfair Display, Cormorant, Jost |

## Conventions

- Plain HTML/CSS/JS. No build step, no framework, no package.json. Keep it that way.
- Fonts come from Google Fonts. Every concept must work offline-ish with a real fallback stack.
- Each concept has a mobile nav toggle and IntersectionObserver `.reveal` fade-ins. Elements with
  `.reveal` start invisible, which matters for screenshots (see below).
- Adding a concept: new folder `options/NN-name/`, add a card to `index.html`, add a thumbnail
  to `assets/thumbs/NN.jpg`, update the table above.
- Product photos from the current site are small (298px squares). Do not scale them past ~450px
  or they go soft. Several are on white backgrounds; check crops so tiles don't look empty.
- `mini-tarts-wide.jpg` is a 1920x885 banner that is mostly white space; it needs a deliberate
  object-position/scale or it renders as a blank box.

## Screenshots and QA

Use headless Chrome with a throwaway profile (never the user's real profile):

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --no-first-run --user-data-dir=/tmp/chrome-qa --window-size=1440,900 \
  --virtual-time-budget=6000 --screenshot=/tmp/out.png "file:///$PWD/options/01-heritage/index.html"
```

- Wrap it in `timeout 60`: Chrome writes the PNG then often hangs instead of exiting.
- Run captures sequentially with separate `--user-data-dir` values; a shared profile deadlocks.
- Headless Chrome on macOS clamps the window to ~500px wide, so `--window-size=390,...` is a lie.
  For true mobile captures, wrap the page in a 390px-wide iframe inside a temporary host page.
- For full-page captures, make a temp copy in the scratchpad with `.reveal{opacity:0` changed to
  `opacity:1` and `transform:none`, and rewrite `../../assets` to absolute `file://` paths.
  Never leave temp copies in the project.
- Thumbnails: 1440x900 capture, resized to 1152x720 JPEG q82 into `assets/thumbs/`.

## Hosting and deployment

- GitHub: `mj1618/coricapastries` (public), branch `main`.
- Vercel: project `corica-website` in team "SupplyWise projects" (scope `supplywise-projects-e7d2d05f`).
  Production alias: https://corica-website.vercel.app
- The Vercel project is Git-connected, so a push to `main` auto-deploys. To deploy immediately:
  `vercel deploy --prod --yes` from the repo root.
- `trailingSlash` must stay `true` in `vercel.json`. With it false, `/options/06-warm-continental`
  loses its trailing slash and the relative `css/style.css` link resolves to the wrong folder.
- Every response carries `X-Robots-Tag: noindex` because this is a client preview, not the real site.

### Vercel CLI gotcha

A `vercel` command left running without stdin (for example `vercel whoami` with no credentials)
hangs on a hidden prompt and, while alive, keeps rewriting the CLI auth file to `{}`. That wipes
any login made afterwards. Always wrap Vercel CLI calls in `timeout`, and before `vercel login`
kill stray processes: `pgrep -fl "bin/vercel"` then `kill -9 <pid>`. Never run `vercel login --debug`;
it prints the access token to stdout.

## Status (2026-09-12)

All six concepts are built, QA'd on desktop and 390px mobile, and deployed. Waiting on the owners
to choose a direction. Known gaps: all nav links other than home are `#` placeholders, there is no
biscuit photo (the Biscuits tile reuses the chocolate tarts image), and the photography needs
replacing with higher-resolution originals before any real build.
