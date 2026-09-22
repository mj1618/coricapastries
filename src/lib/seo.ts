import { catalogue } from '#/data/catalogue'
import type { Category } from '#/data/catalogue'
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
        makesOffer: catalogue.map((category) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Product', name: category.name },
          url: absoluteUrl(`/patisserie/${category.slug}`),
        })),
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

/**
 * A brochure range as an ItemList of Products with their published prices.
 * Everything listed is baked for the counter and orderable for pickup, so the
 * offers are real; `priceRange` products get an AggregateOffer.
 */
export function rangeSchema(category: Category): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} — ${site.name}`,
    url: absoluteUrl(`/patisserie/${category.slug}`),
    numberOfItems: category.products.length,
    itemListElement: category.products.map((product, i) => {
      const prices = product.variants.map((v) => v.price)
      const low = prices.length ? Math.min(...prices) : product.priceFrom
      const high = prices.length
        ? Math.max(...prices)
        : (product.priceTo ?? low)
      const offers =
        low == null
          ? undefined
          : low === high
            ? {
                '@type': 'Offer',
                price: low.toFixed(2),
                priceCurrency: 'AUD',
                availability: 'https://schema.org/InStock',
                seller: { '@id': BUSINESS_ID },
              }
            : {
                '@type': 'AggregateOffer',
                lowPrice: low.toFixed(2),
                highPrice: (high ?? low).toFixed(2),
                priceCurrency: 'AUD',
                offerCount: Math.max(prices.length, 1),
                availability: 'https://schema.org/InStock',
                seller: { '@id': BUSINESS_ID },
              }
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description || undefined,
          image: absoluteUrl(product.image),
          brand: { '@type': 'Brand', name: site.name },
          ...(offers ? { offers } : {}),
        },
      }
    }),
  }
}
