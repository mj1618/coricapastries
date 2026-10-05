import { fullAddress, site } from '#/data/site'
import type { Product } from '#/lib/shop/types'

/**
 * Per-shop availability for the product page, in the shape of Shopify Dawn's
 * pickup-availability line. Google's "product pages with in-store availability"
 * rules (Merchant Center review, 2026-10-05) want the availability and the shop's
 * name or suburb on the page, and the full address once the shopper opens the
 * shop details. Corica has one shop. Server-rendered so Google's StoreBot sees it.
 */
export function StoreAvailability({ product }: { product: Product }) {
  return (
    <div className="mt-5 text-[0.9rem] text-ink-soft">
      <p>
        {product.inStock ? 'Pickup available at' : 'Sold out at'}{' '}
        <span className="text-green">
          {site.name}, {site.address.suburb}
        </span>
        . You choose your pickup day at checkout.
      </p>
      <details className="mt-1">
        <summary className="link-gold inline cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          View shop details
        </summary>
        <address className="mt-2 not-italic">
          {fullAddress} (our only shop).{' '}
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-gold"
          >
            Get directions
          </a>
        </address>
        <p className="mt-1">
          {site.hours.map((h) => `${h.days}: ${h.time}`).join(' · ')}
        </p>
      </details>
    </div>
  )
}
