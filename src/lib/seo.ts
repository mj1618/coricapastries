import { catalogue } from '#/data/catalogue'
import type { Category, Product } from '#/data/catalogue'
import { site } from '#/data/site'

/**
 * Head metadata and structured data for every page.
 *
 * `seo()` builds the title/description/canonical/social block a route's head()
 * returns. `jsonLd()` turns a schema.org object into a head script entry, and
 * the helpers below build the graphs the routes share (the business, breadcrumb
 * trails, product listings), so the facts only ever come from src/data.
 */

/** Google truncates descriptions around 155–160 characters; keep ours under. */
const MAX_DESCRIPTION = 158

/** Descriptions shorter than this read as thin; product pages pad them with facts. */
const MIN_DESCRIPTION = 70

/** Google truncates titles past roughly 60–65 characters. */
const MAX_TITLE = 65

/** Longest to shortest; `pageTitle()` uses the first that keeps the title in bounds. */
const TITLE_SUFFIXES = [
  `${site.name}, ${site.address.suburb} Perth`,
  `${site.name} Perth`,
  site.name,
]

/** The branded 1200×630 social card (JPEG, no transparency) used unless a page overrides it. */
export const DEFAULT_OG_IMAGE = {
  path: '/img/og-card.jpg',
  width: 1200,
  height: 630,
  alt: 'A Corica apple strudel beside the Corica Pastries crest on deep green',
}

export type OgImage = {
  /** Site-relative path or absolute URL. */
  path: string
  width: number
  height: number
  alt: string
}

export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl)
    ? pathOrUrl
    : `${site.siteUrl}${pathOrUrl}`
}

/** Trims at a word boundary and adds an ellipsis when a description runs long. */
export function clampDescription(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60))}…`
}

/**
 * "<name> | Corica Pastries, Northbridge Perth", falling back to a shorter
 * suffix when the full one would push the title past what Google shows.
 */
export function pageTitle(name: string): string {
  for (const suffix of TITLE_SUFFIXES) {
    const title = `${name} | ${suffix}`
    if (title.length <= MAX_TITLE) return title
  }
  return `${name} | ${site.name}`
}

/**
 * A product's meta description, padded with plain facts (who bakes it, where,
 * and how to order) when its own words are too short to describe the page.
 * Never adds product claims: only the name, the shop and the ordering options.
 */
export function productMetaDescription(
  name: string,
  description: string | null | undefined,
): string {
  const own = (description ?? '').replace(/\s+/g, ' ').trim()
  if (own.length >= MIN_DESCRIPTION) return own
  const sentence = own && !/[.!?…]$/.test(own) ? `${own}.` : own
  // Longest wording first; the first that fits needs no ellipsis.
  const leads = [
    `${name} from ${site.name}, ${site.address.suburb} Perth.`,
    `${name} from ${site.name}, ${site.address.suburb}.`,
  ]
  const tails = [
    'Order online for pickup, by phone or in store.',
    'Order online for pickup.',
  ]
  const options = leads.flatMap((lead) =>
    tails.map((tail) => [lead, sentence, tail].filter(Boolean).join(' ')),
  )
  return options.find((text) => text.length <= MAX_DESCRIPTION) ?? options[0]
}

export function seo({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
}: {
  title: string
  description: string
  path?: string
  image?: OgImage
  type?: 'website' | 'product' | 'article'
  /** Keeps the page out of search results while still emitting canonical and social tags. */
  noindex?: boolean
}) {
  const fullTitle = title.includes(site.name)
    ? title
    : `${title} | ${site.name}`
  const url = absoluteUrl(path)
  const summary = clampDescription(description)
  const imageUrl = absoluteUrl(image.path)
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: summary },
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: summary },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: String(image.width) },
      { property: 'og:image:height', content: String(image.height) },
      { property: 'og:image:alt', content: image.alt },
      { property: 'og:locale', content: 'en_AU' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: summary },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:image:alt', content: image.alt },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

/* ------------------------------------------------------------ JSON-LD ---- */

export type JsonLd = Record<string, unknown>

export const BUSINESS_ID = `${site.siteUrl}/#business`
export const WEBSITE_ID = `${site.siteUrl}/#website`

/**
 * A head() `scripts` entry carrying schema.org JSON-LD.
 *
 * The `<` escape is not optional: the HTML parser ends a <script> at the first
 * literal "</script" whatever the JSON quoting says, so any description
 * containing one would break out of the tag. < is the same character to
 * a JSON parser and inert to the HTML one.
 */
export function jsonLd(data: JsonLd | JsonLd[]) {
  return {
    type: 'application/ld+json',
    children: JSON.stringify(data).replace(/</g, '\\u003c'),
  }
}

/** The shop as a schema.org Bakery, plus the WebSite node. Emitted once, on every page. */
export function businessGraph(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Bakery',
        '@id': BUSINESS_ID,
        name: site.name,
        legalName: site.legalName,
        foundingDate: String(site.established),
        founder: { '@type': 'Person', name: site.founder },
        description: `Italian and continental patisserie in ${site.address.suburb}, Perth, baking since ${site.established}. ${site.tagline}.`,
        url: site.siteUrl,
        telephone: site.phone.href.replace('tel:', ''),
        image: absoluteUrl(DEFAULT_OG_IMAGE.path),
        logo: absoluteUrl('/img/logo-large.png'),
        priceRange: '$$',
        servesCuisine: ['Italian', 'Continental'],
        currenciesAccepted: 'AUD',
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address.street,
          addressLocality: site.address.suburb,
          addressRegion: site.address.state,
          postalCode: site.address.postcode,
          addressCountry: 'AU',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.geo.latitude,
          longitude: site.geo.longitude,
        },
        hasMap: site.mapsUrl,
        sameAs: [site.social.facebook, site.social.instagram],
        openingHoursSpecification: site.hours.flatMap((h) =>
          h.schema
            ? [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: h.schema.dayOfWeek,
                  opens: h.schema.opens,
                  closes: h.schema.closes,
                },
              ]
            : [],
        ),
        // The ranges as an OfferCatalog rather than Offers of Products: a
        // Product node needs offers/review/rating of its own, and a range is
        // not a product, so Google flagged every page when they were typed so.
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'The Patisserie',
          url: absoluteUrl('/patisserie'),
          itemListElement: catalogue.map((category) => ({
            '@type': 'OfferCatalog',
            name: category.name,
            url: absoluteUrl(`/patisserie/${category.slug}`),
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: site.siteUrl,
        name: site.name,
        inLanguage: 'en-AU',
        publisher: { '@id': BUSINESS_ID },
      },
    ],
  }
}

/** Home › … trail. The last crumb is the current page and carries no link. */
export function breadcrumbs(
  trail: Array<{ name: string; path?: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map(
      (crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
      }),
    ),
  }
}

/** The page a single catalogue product lives on. */
export function productPath(categorySlug: string, productSlug: string): string {
  return `/patisserie/${categorySlug}/${productSlug}`
}

/**
 * The canonical page for a catalogue product. A product listed in more than
 * one range (Paste Secche is in Biscuits and Gluten Free) has a live page in
 * each, but they are the same content, so every copy canonicalises to the
 * first range in catalogue order that lists it.
 */
export function canonicalProductPath(
  categorySlug: string,
  productSlug: string,
): string {
  const primary = catalogue.find((c) =>
    c.products.some((p) => p.slug === productSlug),
  )
  return productPath(primary?.slug ?? categorySlug, productSlug)
}

/** True when this range's copy of the product is the canonical one. */
export function isCanonicalProduct(
  categorySlug: string,
  productSlug: string,
): boolean {
  return (
    canonicalProductPath(categorySlug, productSlug) ===
    productPath(categorySlug, productSlug)
  )
}

/**
 * The shop's return policy, for every Offer: fresh food made to order is not
 * returnable (owners, 2026-10-02). Google's merchant listings ask for one on
 * each offer. There is no `shippingDetails` because the shop is pickup only.
 */
export const RETURN_POLICY: JsonLd = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'AU',
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
}

/**
 * The published price of a catalogue product as a schema.org offer: a plain
 * Offer when every variant costs the same (or the product only quotes a single
 * "from" price), an AggregateOffer across the variant prices otherwise, and
 * `undefined` when no price is published at all. `url` is the page the offer is
 * made on, which schema.org wants on the Offer itself.
 */
export function productOffers(
  product: Product,
  url?: string,
): JsonLd | undefined {
  const prices = product.variants.map((v) => v.price)
  const low = prices.length ? Math.min(...prices) : product.priceFrom
  const high = prices.length ? Math.max(...prices) : (product.priceTo ?? low)
  if (low == null) return undefined
  const shared = {
    priceCurrency: 'AUD',
    availability: 'https://schema.org/InStock',
    ...(url ? { url } : {}),
    seller: { '@id': BUSINESS_ID },
    hasMerchantReturnPolicy: RETURN_POLICY,
  }
  return low === high
    ? { '@type': 'Offer', price: low.toFixed(2), ...shared }
    : {
        '@type': 'AggregateOffer',
        lowPrice: low.toFixed(2),
        highPrice: (high ?? low).toFixed(2),
        offerCount: Math.max(prices.length, 1),
        ...shared,
      }
}

/**
 * A brochure range as an ItemList of links to its product pages (Google's
 * "summary page" form). The Product markup, with its offers, lives on each
 * product's own page; nesting Products here duplicated it.
 */
export function rangeSchema(category: Category): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} — ${site.name}`,
    url: absoluteUrl(`/patisserie/${category.slug}`),
    numberOfItems: category.products.length,
    itemListElement: category.products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: product.name,
      url: absoluteUrl(canonicalProductPath(category.slug, product.slug)),
    })),
  }
}

/** One catalogue product as a schema.org Product, for its own page. */
export function productSchema(
  category: Category,
  product: Product,
  description: string,
): JsonLd {
  const url = absoluteUrl(canonicalProductPath(category.slug, product.slug))
  const offers = productOffers(product, url)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    image: absoluteUrl(product.image),
    brand: { '@type': 'Brand', name: site.name },
    category: category.name,
    url,
    ...(offers ? { offers } : {}),
  }
}
