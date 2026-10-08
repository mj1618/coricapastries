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
  `src/data/faqs.ts` are the old site's answers, lightly edited. Address, phone and hours were
  confirmed by the owners on 2026-09-22 and updated on 2026-09-23: open Monday to Friday
  8am–5:30pm and Saturday 8am–3pm, closed Sunday and public holidays (owners, 2026-09-23).
  Hours vary over festive periods and customers are pointed to the shop's social media for
  up-to-date information.

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
src/routes/apple-strudel-history.tsx  The strudel's story (the old blog post's URL, kept because it ranks)
src/routes/patisserie/       Range overview (index.tsx) and category listings ($category.tsx)
src/routes/faqs.tsx          FAQs (data in src/data/faqs.ts)
src/routes/contact.tsx       Contact: cards, map embed, enquiry form
src/routes/privacy.tsx       Privacy policy (describes what the site actually does; keep in sync)
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

**Variant picker wording.** Groups are a "Choose a size" choice by default, but some are
flavours: SupplyWise publishes every group's `selectionLabel` empty, so the handful that need
different wording are mapped by group name in `GROUP_CHOICE_LABELS` in `src/lib/shop/browse.ts`
(currently `Torta Slice → Choose a flavour`). `groupChoiceLabel()` there is the single source of
that wording, used by the grid card, the group detail page and the account tiles. If SupplyWise
later sets a real `selectionLabel`, it wins over the map.

**Proxy.** `src/routes/api/sw/$.ts` forwards `/api/sw/*` to
`https://actions.supplywise.com.au/api/retail/v1/coricapastries`, passing method, query, body,
`Content-Type` and `Authorization` through unchanged. The browser only ever talks to our own
origin, so ad and privacy blockers cannot silently drop a storefront request. Server-side code
calls SupplyWise directly (`SW_DIRECT_BASE`); `apiBase()` in `src/lib/shop/config.ts` picks.

**Cart and favourites.** Client-only, in `localStorage`: the cart under `sw_cart_coricapastries`
and favourites under `sw_favourites_coricapastries` (`STORAGE_KEYS` in `src/lib/shop/config.ts`).
`CartProvider` is mounted in `__root.tsx`, so the Header cart icon (count bubble, links to
`/shop/cart`) works on every page; it only reads storage after mount (`cart.hydrated`) to avoid a
hydration mismatch. Passing a second `{ name, image, details }` argument to `cart.add()` opens the
"Added to your cart" pop-down under the header (`components/shop/CartNotification.tsx`, modelled
on Shopify's Dawn cart notification); every Add button should pass it.

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

## SEO

The canonical origin is `site.siteUrl` = `https://coricapastries.com.au` (apex; www redirects
to it in Vercel domain settings, so the old site's www links land in one hop). Every page's head comes from
`seo()` in `src/lib/seo.ts`: title, description (clamped to 158 chars), canonical, Open Graph
and Twitter tags, optional `noindex`. Pass the full title when it should not end in
"| Corica Pastries". `jsonLd()` turns a schema.org object into a head `scripts` entry with the
mandatory `</script` escape; use it for all structured data.

- **Structured data.** `businessGraph()` (Bakery + WebSite, from `site.ts` including `geo` and the
  machine-readable `hours[].schema`) is emitted from `__root.tsx` on every page. Range pages
  add BreadcrumbList + ItemList of Products; brochure product pages add Product + breadcrumbs;
  shop product pages add Product/AggregateOffer (`src/lib/shop/schema.ts`); FAQs add FAQPage.
  Every Offer carries `RETURN_POLICY` from `seo.ts` (no returns, owners 2026-10-02; the customer
  wording is the `returns` FAQ, which Merchant Center's return policy links to); there is no
  `shippingDetails` because the shop is pickup only.
- **Titles and descriptions.** Per-range title/description live in `categoryMeta` in
  `src/data/catalogue.ts`. Range and product pages carry "Northbridge Perth" in the title.
  `productMeta` (same file, keyed by product slug) overrides one product page's title or
  description; only the two honey cakes use it so far.
  The shop's `?category=` views get their own title but canonical to `/shop`; the brochure
  `/patisserie` pages are the indexable range pages.
- **Crawl control.** `public/robots.txt` (disallows cart, account, api), `/sitemap.xml` (server
  route `src/routes/sitemap[.]xml.ts`: brochure pages, ranges, products, `/shop`, and the live
  shop product and variant-group URLs). Until 2026-10-05 most SupplyWise slugs were a
  `-copy` of another product's name; `/shop/$slug` 301s the 92 old product URLs Merchant Center
  had to their real slugs via the explicit map in `src/lib/shop/legacySlugs.ts` (never derive one
  by stripping the suffix: `almond-slice-copy` was Amore). Cart, account and
  order pages are `noindex`. Unknown URLs return a 404 status; their "Page not found" title and
  noindex come from the root `head()`, which checks the matches for the router's `_notFound`
  flag (a route that throws `notFound()` never runs its own `head()`).
  `vercel.json` sends `X-Robots-Tag: noindex` only when the host is not coricapastries.com.au,
  so staging is never indexed and cutover needs no config change.
- **Redirects.** `vercel.json` holds 115 permanent redirects from the old WordPress URLs
  (`/about-us`, `/contact-us`, `/catering` → contact, `/product-category/<slug>` including the
  misspelt `bisucits` and its `/page/<n>` pagination, all 79 `/product/<slug>` URLs → the matching
  `/patisserie/<range>/<product>` page or the range page when the product is gone, the blog posts,
  `/blogs`, `/category/*`, `/page/<n>`, `/shop/page/<n>`, `/privacy-policy-2` → `/privacy`,
  WooCommerce cart/account pages, and the Rank Math sitemaps), then one last catch-all
  `/:path+/` → `/:path+` that strips trailing slashes from every other URL. There is deliberately
  no `trailingSlash` setting: Vercel emits that redirect before all custom ones, so `/about-us/`
  took two hops (`/about-us`, then `/about`). Now sources end in `{/}?` and an old URL with or
  without the slash reaches its destination in one hop (two from www). First match wins, so new
  redirects go above the catch-all. Query strings carry over. Vercel compiles sources with
  path-to-regexp; test with `@vercel/routing-utils` (`getTransformedRoutes` gives the real order)
  that both `/x` and `/x/` hit the intended rule and new-site `/x/` hits only the catch-all.
- **Social card.** `public/img/og-card.jpg` is a 1200×630 JPEG (rendered from an HTML
  composition with headless Chrome; the hero PNG is transparent and unsuitable on its own).
  Range and product pages override it with their 800×800 photo.
- **Search Console.** The old site's `google-site-verification` meta is in `__root.tsx`; after
  cutover, submit `/sitemap.xml` in Search Console and use the Change of Address tool only if
  the domain itself changes (it does not).

## Analytics

Google Tag Manager container `GTM-NKFF6BS`, carried over from the old WordPress site
(`gtmId` in `src/data/site.ts`, snippet in `__root.tsx`). The container, managed in the GTM
dashboard, currently fires GA4, Google Ads conversion/remarketing tags, a Facebook pixel and a
dead Universal Analytics tag. The inline snippet only runs when the hostname matches
`analyticsHostPattern` (coricapastries.com.au and subdomains), so localhost and the vercel.app
staging alias never send hits; there is deliberately no `<noscript>` iframe for the same reason.
GA4's history-change enhanced measurement covers client-side navigation.

Events are pushed to `dataLayer` from `src/lib/analytics.ts` (2026-10-05): the GA4 ecommerce
events `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`,
`view_cart` and `begin_checkout` (items carry the SupplyWise product id, the Merchant Center
offer id), which the container's existing GA4 ecommerce tag forwards, and `contact_form_submit`
when an enquiry is sent. Nobody on our side has access to the GTM container (it is not under
the coricapastriesau Google account), and its form trigger still looks for the old WordPress
form fields, so nothing in GTM listens for `contact_form_submit` yet. Instead the form moves to
`/contact?sent=1` on success and a GA4 custom event (Admin → Events → Create event) turns that
page view into the `form_submit` key event; if GTM is ever fixed, remove one of the two. There is no `purchase` event: payment happens on SupplyWise's hosted
checkout on another domain, so `begin_checkout` is the conversion (owner's call, 2026-10-05).
`cart.add()` reports `add_to_cart` only when its second argument carries `unitCents`. React
StrictMode doubles the view events in `npm run dev` only.

## Contact form

`src/server/contact.ts` sends through Resend using plain `fetch`. It needs `RESEND_API_KEY`
(the SupplyWise Resend account's key, set in the Vercel project on 2026-09-22) and without it
the form shows a "please call the shop" message instead of failing silently. Enquiries go to
`enquiries@corica.com.au` by default (`CONTACT_TO_EMAIL` overrides) from
`support@supplywise.com.au` (`CONTACT_FROM_EMAIL` overrides), because the sender must be on a
domain verified in that Resend account and coricapastries.com.au is not. Never use a `noreply@`
sender (Resend flags it as hurting inbox placement; it was `noreply@` until 2026-10-01). The
shopper's address is the reply-to.

Bot protection, all invisible to people: a honeypot field, a timing check (the form sends the
epoch ms it mounted and the server rejects anything under 3 s, `MIN_FILL_MS`), and Cloudflare
Turnstile. The honeypot's DOM field must stay neutral and hidden — a meaningless `name`, no
`<label>`, and a `display: none` wrapper — because browser and password-manager autofill treats
a field called "company" (or labelled "Company") as a real organisation box and fills it in for
ordinary customers (Chrome skips undisplayed fields but fills off-screen ones), and the server then
discarded the enquiry while still reporting success (2026-10-01). `autoComplete="off"` does not
prevent this; the `data-*-ignore` attributes in `ContactForm.tsx` help. As a backstop the server
never discards a honeypot hit: it sends the enquiry with a "[Possible spam]" subject and logs the
hit (without the field's value, which autofill fills with customers' own details).

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
  `"framework": "tanstack-start"` and an `X-Robots-Tag: noindex` header for non-production hosts.
- The Vercel project is Git-connected, so a push to `main` auto-deploys. To deploy immediately:
  `timeout 600 vercel deploy --prod --yes` from the repo root (needs `.vercel/project.json`,
  which is gitignored; `vercel link --project corica-website --scope supplywise-projects-e7d2d05f --yes` recreates it).
- Functions (`/shop*` misses, `/api/*`, 404s) run in Vercel's default `iad1`; static pages and
  cached `/shop` come from the Sydney edge. Kept on purpose (2026-10-01): SupplyWise's API is
  Convex behind Cloudflare, ~300 ms from Perth even for a 204, so it is not in Australia. `syd1`
  would put every server→SupplyWise call (up to two per product page) across the Pacific
  instead of the one user→iad1 hop. Nitro writes no `regions` to `.vc-config.json`; set
  `"regions"` in `vercel.json` if SupplyWise ever moves.
- coricapastries.com.au is live on Vercel (Search Console property `sc-domain:coricapastries.com.au`).
  The `X-Robots-Tag` header stays: it keeps the vercel.app alias from being indexed as a duplicate.

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

Still to do: owners to confirm prices, supply higher-resolution photography, create a
Turnstile widget in Cloudflare for the site's domain and set its two keys on Vercel, set the
www → apex redirect in Vercel domains, move the coricapastries.com.au
domain to Vercel, and register the storefront domain under SupplyWise Settings → Custom Storefront
(see the Shop section).
