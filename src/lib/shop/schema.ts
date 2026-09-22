import { site } from '#/data/site'
import { BUSINESS_ID, absoluteUrl } from '#/lib/seo'
import { htmlToText } from '#/lib/shop/sanitize'
import type { JsonLd } from '#/lib/seo'
import type { Product, VariantGroup } from '#/lib/shop/types'

/**
 * schema.org Product markup for the live shop pages, from SupplyWise data.
 * Prices are in cents on the wire; schema wants a decimal string.
 */

const IN_STOCK = 'https://schema.org/InStock'
const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

function dollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

function base(name: string, description: string | null, image: string | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...(description ? { description: htmlToText(description) } : {}),
    ...(image ? { image } : {}),
    brand: { '@type': 'Brand', name: site.name },
  }
}

export function productSchema(product: Product, path: string): JsonLd {
  return {
    ...base(product.name, product.description, product.image),
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(path),
      price: dollars(product.priceCents),
      priceCurrency: 'AUD',
      availability: product.inStock ? IN_STOCK : OUT_OF_STOCK,
      seller: { '@id': BUSINESS_ID },
    },
  }
}

/** A variant group (sizes of one cake) as a Product with an AggregateOffer spanning its members. */
export function variantGroupSchema(
  parent: VariantGroup,
  products: Product[],
  path: string,
): JsonLd {
  const lead: Product | undefined =
    products.find((p) => p.inStock) ?? products.at(0)
  const prices = products.map((p) => p.priceCents)
  return {
    ...base(
      parent.name,
      parent.description || lead?.description || null,
      lead?.image ?? parent.image,
    ),
    offers:
      prices.length > 0
        ? {
            '@type': 'AggregateOffer',
            url: absoluteUrl(path),
            lowPrice: dollars(Math.min(...prices)),
            highPrice: dollars(Math.max(...prices)),
            priceCurrency: 'AUD',
            offerCount: prices.length,
            availability: products.some((p) => p.inStock)
              ? IN_STOCK
              : OUT_OF_STOCK,
            seller: { '@id': BUSINESS_ID },
          }
        : undefined,
  }
}
