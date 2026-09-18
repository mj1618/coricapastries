# Corica Pastries website

Production website for Corica Pastries, a Perth (Northbridge) Italian/continental patisserie
established 1957 by Giuseppe Corica. Current live (old WordPress) site: https://www.coricapastries.com.au/
This repo replaces it. The owners chose the "Heritage" direction from six home page concepts
(tagged `concepts-v1` in git; see `git show concepts-v1:options/01-heritage/index.html`).

## The brief

- Nearly 70 years of history. Be respectful of it. Nothing too bold.
- "Traditional, but a modern quality take on traditional."
- The logo is NOT changing. Logo colours: deep green `#004d3f`, gold `#fadf3e`, cream, small red accents.
- Owner feedback on the Heritage concept (2026-09-18): larger strudel hero like the old home page,
  remove catering, revamp About Us, make it easy to use.
- Keep copy factual. Do not invent history, awards, family names or product claims. Established
  facts live in `src/data/site.ts` (address, phone, hours) and `src/data/catalogue.ts` (products,
  prices and descriptions scraped from the old site on 2026-09-18). The FAQ answers in
  `src/data/faqs.ts` are the old site's answers, lightly edited. Hours are from the old site and
  unconfirmed by the owners.

## Stack

TanStack Start (React 19, file-based routing, Vite 8) + Tailwind v4 + Nitro, deployed on Vercel.
Every route is static content and is prerendered to HTML at build time (`prerender` in
`vite.config.ts`, with link crawling so the `$category` pages are discovered). The only server
code is the contact form's server function.

```
src/routes/__root.tsx        HTML shell, fonts, global meta, Header/Footer, 404 page
src/routes/index.tsx         Home
src/routes/about.tsx         About Us
src/routes/patisserie/       Range overview (index.tsx) and category listings ($category.tsx)
src/routes/faqs.tsx          FAQs (data in src/data/faqs.ts)
src/routes/contact.tsx       Contact: cards, map embed, enquiry form
src/server/contact.ts        Server function that emails enquiries via the Resend REST API
src/components/              Header, Footer, Reveal (scroll fade-in), ui.tsx (Eyebrow, Ornament,
                             ButtonLink, PageHero), plus per-page folders
src/data/site.ts             Business facts and nav
src/data/catalogue.ts        Categories and products (edit here to change prices/copy)
src/lib/seo.ts               head() helper for titles, descriptions, canonical, OG tags
src/styles.css               Tailwind @theme tokens and the shared component classes
public/img/                  Photography and logos. products/ holds 800x800 product photos
                             from the old site; strudel-hero.png is the 1089x741 hero cutout.
```

Design tokens (Tailwind): colours `green green-deep green-soft cream cream-deep ivory gold
gold-soft red ink ink-soft`; fonts `font-display` (Cormorant Garamond) and `font-body`
(EB Garamond), loaded from Google Fonts in `__root.tsx`. Shared classes: `.wrap .eyebrow
.eyebrow-green .orn .btn .btn-solid .btn-gold .btn-cream .link-gold .frame-card .reveal`.

## Conventions

- `npm run dev` (port 3000), `npm run build`, `npm run typecheck`, `npm run lint`.
  `.claude/launch.json` defines the `corica-dev` preview server.
- Never hardcode the phone, address or hours; import from `src/data/site.ts`.
- `.reveal` elements only hide-then-fade when JS has added `.js` to `<html>`, so prerendered
  HTML and no-JS visitors see everything. Keep it that way.
- Product photos are 800px squares; do not upscale. `mini-tarts-wide.jpg` and
  `shop-counter-wide.jpg` are wide banners that need a deliberate object-position.
- Adding a category: add it to `catalogue` in `src/data/catalogue.ts`; the route, footer links,
  category switcher and prerender pick it up automatically.
- There is no online shop or cart. Ordering is by phone or in store, and copy should say so.

## Contact form

`src/server/contact.ts` sends through Resend using plain `fetch`. It needs `RESEND_API_KEY`
and `CONTACT_TO_EMAIL` (see `.env.example`) set in the Vercel project. Without them the form
shows a "please call the shop" message instead of failing silently.

## Screenshots and QA

Use headless Chrome with a throwaway profile (never the user's real profile) against the dev
server:

```
timeout 60 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --no-first-run --force-prefers-reduced-motion --disable-features=LazyImageLoading --user-data-dir=/tmp/chrome-qa --window-size=1440,2400 \
  --virtual-time-budget=8000 --screenshot=/tmp/out.png http://localhost:3000/
```

- Wrap it in `timeout 60`: Chrome writes the PNG then often hangs instead of exiting.
- Run captures sequentially with separate `--user-data-dir` values; a shared profile deadlocks.
- Headless Chrome on macOS clamps the window to ~500px wide. For true mobile captures, wrap the
  page in a 390px-wide iframe inside a temporary host page.
- `--force-prefers-reduced-motion` makes `.reveal` sections render opaque (via the reduced-motion
  rule in `styles.css`); without it IntersectionObserver never fires under a virtual time budget
  and sections come out blank. `--disable-features=LazyImageLoading` makes lazy images load too.

## Hosting and deployment

- GitHub: `mj1618/coricapastries` (public), branch `main`.
- Vercel: project `corica-website` in team "SupplyWise projects" (scope `supplywise-projects-e7d2d05f`).
  Production alias: https://corica-website.vercel.app . `vercel.json` sets
  `"framework": "tanstack-start"` and a global `X-Robots-Tag: noindex` header.
- The Vercel project is Git-connected, so a push to `main` auto-deploys. To deploy immediately:
  `timeout 600 vercel deploy --prod --yes` from the repo root (needs `.vercel/project.json`,
  which is gitignored; `vercel link --project corica-website --scope supplywise-projects-e7d2d05f --yes` recreates it).
- Remove the `X-Robots-Tag` header from `vercel.json` when the real domain is pointed at Vercel.
  Until then the vercel.app URL must not be indexed as a duplicate of the live site.

### Vercel CLI gotcha

A `vercel` command left running without stdin (for example `vercel whoami` with no credentials)
hangs on a hidden prompt and, while alive, keeps rewriting the CLI auth file to `{}`. That wipes
any login made afterwards. Always wrap Vercel CLI calls in `timeout`, and before `vercel login`
kill stray processes: `pgrep -fl "bin/vercel"` then `kill -9 <pid>`. Never run `vercel login --debug`;
it prints the access token to stdout.

## Status (2026-09-18)

Heritage direction chosen and built out as a full site: Home, About, Patisserie (8 ranges),
FAQs, Contact, 404. Deployed to the vercel.app alias. Still to do: owners to confirm hours and
prices, supply higher-resolution photography, provide the enquiry recipient address (and a
Resend key) for the contact form, and move the coricapastries.com.au domain to Vercel.
