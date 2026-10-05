import type { CartLine, Product } from '#/lib/shop/types'

/**
 * dataLayer events for Google Tag Manager (container in `src/data/site.ts`).
 * The container's GA4 ecommerce tag fires on the standard event names below and
 * reads `ecommerce.items / value / currency`; the contact form's tags fire on
 * `contact_form_submit`. GTM itself only loads on the production host, so on
 * localhost and staging these pushes go nowhere.
 */

type EcommerceEvent =
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'

export type AnalyticsItem = {
  /** SupplyWise product id, the same id Merchant Center has as the offer id. */
  item_id: string
  item_name: string
  /** Unit price in dollars. */
  price: number
  quantity: number
  item_category?: string
  item_list_name?: string
  index?: number
}

function push(data: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push(data)
}

export function analyticsItem(
  product: Pick<Product, 'id' | 'name'>,
  unitCents: number,
  extra: Partial<Omit<AnalyticsItem, 'item_id' | 'price'>> = {},
): AnalyticsItem {
  return {
    item_id: product.id,
    item_name: product.name,
    price: unitCents / 100,
    quantity: 1,
    ...extra,
  }
}

/** Cart lines as items, priced with their option fees. Lines whose product is gone are skipped. */
export function cartItems(
  lines: CartLine[],
  byId: Map<string, Product>,
): AnalyticsItem[] {
  return lines.flatMap((line) => {
    const product = byId.get(line.productId)
    if (!product) return []
    const fees = line.optionsSelected.reduce(
      (n, o) => n + (o.feeAmountCents ?? 0),
      0,
    )
    return [
      analyticsItem(product, product.priceCents + fees, {
        quantity: line.quantity,
      }),
    ]
  })
}

export function trackEcommerce(
  event: EcommerceEvent,
  items: AnalyticsItem[],
  extra: Record<string, unknown> = {},
) {
  if (items.length === 0) return
  const value = items.reduce((n, i) => n + i.price * i.quantity, 0)
  // GTM merges pushes, so clear the previous event's ecommerce object first.
  push({ ecommerce: null })
  push({
    event,
    ecommerce: {
      currency: 'AUD',
      value: Math.round(value * 100) / 100,
      ...extra,
      items,
    },
  })
}

export function trackContactFormSubmit() {
  push({ event: 'contact_form_submit' })
}
