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
The brochure pages are static content and are prerendered to HTML at build time (`prerender` in
`vite.config.ts`, with link crawling so the `$category` pages are discovered). `/shop*` and
`/api/*` are excluded from the prerender filter because they need live SupplyWise data. The
server code is the contact form's server function and the SupplyWise proxy.

```
src/routes/__root.tsx        HTML shell, fonts, global meta, CartProvider, Header/Footer, 404
src/routes/index.tsx         Home
src/routes/about.tsx         About Us
src/routes/patisserie/       Range overview (index.tsx) and category listings ($category.tsx)
src/routes/faqs.tsx          FAQs (data in src/data/faqs.ts)
src/routes/contact.tsx       Contact: cards, map embed, enquiry form
src/routes/shop.tsx          Shop layout route: loads the store snapshot for every /shop page
src/routes/shop/             index.tsx (grid, ?category=), $slug.tsx (product),
                             parent/$parentSlug.tsx (variant group), cart.tsx, account.tsx
src/routes/api/sw/$.ts       Same-origin proxy to the SupplyWise Retail Storefront API
src/server/contact.ts        Server function that emails enquiries via the Resend REST API
src/components/              Header, Footer, Reveal (scroll fade-in), ui.tsx (Eyebrow, Ornament,
                             ButtonLink, PageHero), plus per-page folders including shop/
src/lib/shop/                SupplyWise client: api, catalog, browse, cart, favourites, auth,
                             checkout, money, sanitize, types, config (slug, bases, storage keys)
src/data/site.ts             Business facts and nav
src/data/catalogue.ts        Categories and products (edit here to change prices/copy)
src/data/shopLinks.ts        Catalogue slug → shop `?category=` key, for brochure→shop links
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
  category switcher and prerender pick it up automatically. Also add its shop key to
  `shopCategoryBySlug` in `src/data/shopLinks.ts` so the "Order online" links keep working.
- Ordering is online at `/shop` for **pickup**, by phone or in store. Copy should offer all three
  and must never promise delivery — the shop has no delivery option.
- Brochure pages never link to a raw `/shop?category=…` string. They go through
  `shopCategory(slug)` in `src/data/shopLinks.ts`, because two catalogue slugs differ from the
  shop's category keys (`special-occasions → special-occasion`, `gluten-free → gluten-free-range`).

## Shop (SupplyWise)

The online shop at `/shop` is a custom storefront over the SupplyWise Retail Storefront API.
Reference spec: https://supplywise.com.au/retail-shop-builder-llm.txt

**Routes.** `/shop` (product grid, filtered by `?category=<key>`), `/shop/$slug` (a product),
`/shop/parent/$parentSlug` (a variant group), `/shop/cart`, `/shop/account`. Category keys come
from the SupplyWise category names: `small-pastries, extras, mini-range, biscuits, strudels,
special-occasion, gluten-free-range, birthday-cakes, christmas`.

**Store data.** `src/routes/shop.tsx` is the layout route for every `/shop` page. Its loader calls
`getStore()` once and shares the snapshot with children via `Route.useLoaderData()` /
`useLoaderData({ from: '/shop' })`. It has `staleTime: 60_000` and sends
`cache-control: public, s-maxage=60, stale-while-revalidate=600`. Shop routes are excluded from
the prerender filter in `vite.config.ts`, so they render on request (SSR on the first hit) and
prices and stock stay live.

**Proxy.** `src/routes/api/sw/$.ts` forwards `/api/sw/*` to
`https://actions.supplywise.com.au/api/retail/v1/coricapastries`, passing method, query, body,
`Content-Type` and `Authorization` through unchanged. The browser only ever talks to our own
origin, so ad and privacy blockers cannot silently drop a storefront request. Server-side code
calls SupplyWise directly (`SW_DIRECT_BASE`); `apiBase()` in `src/lib/shop/config.ts` picks.

**Cart and favourites.** Client-only, in `localStorage`: the cart under `sw_cart_coricapastries`
and favourites under `sw_favourites_coricapastries` (`STORAGE_KEYS` in `src/lib/shop/config.ts`).
`CartProvider` is mounted in `__root.tsx`, so the Header cart badge works on every page; it only
reads storage after mount (`cart.hydrated`) to avoid a hydration mismatch.

**Checkout hand-off.** We never take payment. `createCheckout()` POSTs the cart to `/checkout`
and gets back `{ token, checkoutUrl }`; the shopper is redirected to SupplyWise's hosted
checkout, which owns the pickup calendar, delivery pricing and payment. Corica is **pickup only**
(`shippingType: 'pickup-only'`), so the shopper picks a pickup day at checkout and collects from
106 Aberdeen Street. Some products carry a notice period (1–3 days) that the hosted checkout
enforces.

**Shopper login.** PKCE (S256) against `https://supplywise.com.au/coricapastries/retail/authorize`,
with `redirect_uri` set to `<origin>/shop/account`. The verifier and CSRF state are stashed in
`sessionStorage` under `sw_pkce`; tokens live under `sw_retail_tokens`. The redirect URI has to be
byte-identical between the authorize call and the token exchange.

**Supplier-side setup still required.** In SupplyWise, under **Settings → Custom Storefront**, add
the storefront domain and mark it the default. Until that is done the post-checkout "Back to
store" links will not return to `/shop`, and shopper login will not redirect back to us.

## Contact form

`src/server/contact.ts` sends through Resend using plain `fetch`. It needs `RESEND_API_KEY`
(the SupplyWise Resend account's key, set in the Vercel project on 2026-09-22) and without it
the form shows a "please call the shop" message instead of failing silently. Enquiries go to
`info@coricapastries.com.au` by default (`CONTACT_TO_EMAIL` overrides) from
`noreply@supplywise.com.au` (`CONTACT_FROM_EMAIL` overrides), because the sender must be on a
domain verified in that Resend account and coricapastries.com.au is not. The shopper's address
is the reply-to.

Bot protection, all invisible to people: a honeypot field, a timing check (the form sends the
epoch ms it mounted and the server rejects anything under 3 s, `MIN_FILL_MS`), and Cloudflare
Turnstile (`src/components/contact/turnstile.ts`, `appearance: 'interaction-only'`). Turnstile
needs `VITE_TURNSTILE_SITE_KEY` (client) and `TURNSTILE_SECRET_KEY` (server); when the secret
is unset the server skips verification with a warning, so the form still works before the
Cloudflare widget exists. `vite.config.ts` copies `.env` into `process.env` so server functions
see it under `npm run dev`; Cloudflare's always-pass test keys are listed in `.env.example`.

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
FAQs, Contact, 404. Deployed to the vercel.app alias.

The SupplyWise-powered online shop is being built at `/shop`, and the brochure pages now point at
it: "Order online" in the hero, on every range tile, in the patisserie "How to order" band, on
each range's order card, and in the FAQs, About, Contact and 404 copy. All of it says pickup from
Aberdeen Street, never delivery.

Still to do: owners to confirm hours and prices, supply higher-resolution photography, create a
Turnstile widget in Cloudflare for the site's domain and set its two keys on Vercel, move the coricapastries.com.au
domain to Vercel, and register the storefront domain under SupplyWise Settings → Custom Storefront
(see the Shop section).
