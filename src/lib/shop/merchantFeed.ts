import { site } from '#/data/site'
import { htmlToText } from '#/lib/shop/sanitize'
import { parentByProductId } from '#/lib/shop/catalog'
import type { Product, Store } from '#/lib/shop/types'

/**
 * Google Merchant Center feeds, built live from SupplyWise. Merchant Center fetches
 * them daily (scheduled file data sources), so the listings never go stale or
 * expire the way API-inserted products did after 30 days.
 *
 * Corica is pickup only: products go to free local listings with local inventory
 * at the shop's Business Profile store code, never to delivery-based listings.
 */

/** The Business Profile store code for 106 Aberdeen Street, as Merchant Center knows it. */
export const MERCHANT_STORE_CODE = '30301'

const GOOGLE_CATEGORY = 'Food, Beverages & Tobacco > Food Items > Bakery'

/** SupplyWise image URLs look like this; the id is a Convex storage id. */
const SW_IMAGE = /^https:\/\/actions\.supplywise\.com\.au\/getImage\/([a-z0-9]+)$/

/** Path of the same-origin image route (src/routes/product-images/$id.ts). */
export const PRODUCT_IMAGE_PATH = '/product-images'

/**
 * A SupplyWise image as a URL on our own domain. Merchant Center flagged every
 * SupplyWise image link "Invalid image encoding" (the link redirects to a Convex
 * storage host), so the feed points at a route that serves the bytes directly.
 */
export function ownImageUrl(url: string): string {
  const m = SW_IMAGE.exec(url)
  return m ? `${site.siteUrl}${PRODUCT_IMAGE_PATH}/${m[1]}` : url
}

/** SupplyWise notice days → Merchant Center pickup_sla. */
function pickupSla(p: Product): string {
  const days = p.minDeliveryDays ?? 0
  if (days <= 1) return 'next day'
  if (days <= 7) return `${days}-day`
  return 'multi-week'
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Products Merchant Center can list: a shop page to link to and a photo. */
export function feedProducts(store: Store): Product[] {
  return store.products.filter((p) => p.slug && p.image)
}

function description(p: Product): string {
  const own = htmlToText(p.description).trim()
  const facts = `${p.name} from ${site.name}, ${site.address.suburb} Perth. Order online for pickup, by phone or in store.`
  return (own ? `${own}\n${facts}` : facts).slice(0, 5000)
}

function tag(name: string, value: string): string {
  return `      <${name}>${esc(value)}</${name}>`
}

function rss(title: string, items: string[][]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    `    <title>${esc(title)}</title>`,
    `    <link>${site.siteUrl}/shop</link>`,
    `    <description>${esc(title)}</description>`,
    ...items.map((lines) => ['    <item>', ...lines, '    </item>'].join('\n')),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

/** The primary product feed. One item per product; sizes share an item_group_id. */
export function productFeed(store: Store): string {
  const parents = parentByProductId(store)
  const categories = new Map(store.categories.map((c) => [c.id, c.name]))
  const items = feedProducts(store).map((p) => {
    const group = parents.get(p.id)
    const images = p.images.length ? p.images : [p.image!]
    const types = p.categoryIds
      .map((id) => categories.get(id))
      .filter((n): n is string => !!n)
    return [
      tag('g:id', p.id),
      tag('g:title', p.name),
      tag('g:description', description(p)),
      tag('g:link', `${site.siteUrl}/shop/${p.slug}`),
      tag('g:image_link', ownImageUrl(images[0])),
      ...images.slice(1, 11).map((u) => tag('g:additional_image_link', ownImageUrl(u))),
      tag('g:availability', p.inStock ? 'in_stock' : 'out_of_stock'),
      tag('g:price', `${(p.priceCents / 100).toFixed(2)} AUD`),
      tag('g:brand', site.name),
      tag('g:condition', 'new'),
      tag('g:identifier_exists', 'no'),
      tag('g:google_product_category', GOOGLE_CATEGORY),
      ...types.map((t) => tag('g:product_type', t)),
      ...(group ? [tag('g:item_group_id', group.id)] : []),
      tag('g:pickup_method', 'buy'),
      tag('g:pickup_sla', pickupSla(p)),
    ]
  })
  return rss(`${site.name} products`, items)
}

/** The local inventory feed: every listed product is sold at the one shop. */
export function localInventoryFeed(store: Store): string {
  const items = feedProducts(store).map((p) => [
    tag('g:store_code', MERCHANT_STORE_CODE),
    tag('g:id', p.id),
    tag('g:availability', p.inStock ? 'in_stock' : 'out_of_stock'),
    tag('g:pickup_method', 'buy'),
    tag('g:pickup_sla', pickupSla(p)),
  ])
  return rss(`${site.name} local inventory`, items)
}
