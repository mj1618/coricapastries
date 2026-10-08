import type { ReactNode } from 'react'
import { formatCents } from '#/lib/shop/money'
import type { Order } from '#/lib/shop/types'

/** The pieces of an order shared by the account order page and the order confirmation. */

export function OrderRow({
  term,
  children,
}: {
  term: string
  children: ReactNode
}) {
  return (
    <div className="border-b border-gold-soft/70 pb-2">
      <dt className="text-[0.72rem] tracking-[0.22em] text-gold uppercase">
        {term}
      </dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  )
}

const ADDRESS_KEYS = [
  'addressLine1',
  'addressLine2',
  'suburb',
  'state',
  'postcode',
  'country',
]

export function OrderAddress({ address }: { address: Record<string, string> }) {
  const known = ADDRESS_KEYS.map((k) => address[k]).filter(Boolean)
  const parts = known.length
    ? known
    : Object.values(address).filter((v) => typeof v === 'string' && v)
  if (parts.length === 0) return null
  return (
    <span>
      {parts.map((part, i) => (
        <span key={i} className="block">
          {part}
        </span>
      ))}
    </span>
  )
}

/** Every line on the order: photo, name, options, quantity and line total. */
export function OrderItems({ items }: { items: Order['items'] }) {
  return (
    <ul className="border-t border-gold-soft">
      {items.map((item, i) => (
        <li
          key={`${item.productId}-${i}`}
          className="flex gap-4 border-b border-gold-soft py-4"
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden bg-cream-deep/40">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[1.2rem] text-green">{item.name}</p>
            {item.sku ? (
              <p className="text-[0.95rem] text-ink-soft">SKU {item.sku}</p>
            ) : null}
            {item.optionsSelected.length > 0 ? (
              <ul className="mt-1 text-[0.95rem] text-ink-soft">
                {item.optionsSelected.map((option, oi) => (
                  <li key={oi}>
                    {option.name}: {option.value}
                    {option.feeAmountCents
                      ? ` (+${formatCents(option.feeAmountCents)})`
                      : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-1 text-[1rem] text-ink-soft">
              {item.quantity} × {formatCents(item.unitPriceCents)}
              {item.chargeGst ? ' incl. GST' : ' (GST free)'}
            </p>
          </div>
          <p className="shrink-0 self-center font-display text-[1.25rem] text-green">
            {formatCents(lineTotal(item))}
          </p>
        </li>
      ))}
    </ul>
  )
}

/**
 * The totals breakdown. The guide documents `totals` on the full order, but an older
 * or partial response could omit it, and the page must still render — so it falls
 * back to the bare order total.
 */
export function OrderTotals({ order }: { order: Order }) {
  const totals = order.totals as Order['totals'] | undefined
  return totals ? (
    <dl className="mt-6 ml-auto max-w-[420px] space-y-2 text-[1.05rem]">
      <Total term="Items (incl. GST)" cents={totals.itemsIncGstCents} />
      {totals.lineDiscountIncGstCents ? (
        <Total
          term="Item discounts"
          cents={-Math.abs(totals.lineDiscountIncGstCents)}
        />
      ) : null}
      {totals.cartDiscountIncGstCents ? (
        <Total
          term="Cart discount"
          cents={-Math.abs(totals.cartDiscountIncGstCents)}
        />
      ) : null}
      {totals.shippingIncGstCents ? (
        <Total term="Delivery (incl. GST)" cents={totals.shippingIncGstCents} />
      ) : null}
      {totals.creditNotesIncGstCents ? (
        <Total
          term="Credit notes"
          cents={-Math.abs(totals.creditNotesIncGstCents)}
        />
      ) : null}
      <Total term="GST included" cents={totals.gstCents} muted />
      <div className="flex justify-between border-t border-gold-soft pt-3 font-display text-[1.5rem] text-green">
        <dt>Total</dt>
        <dd>{formatCents(totals.totalIncGstCents)}</dd>
      </div>
    </dl>
  ) : (
    <p className="mt-6 text-right font-display text-[1.5rem] text-green">
      {formatCents(order.totalIncGstCents)}
    </p>
  )
}

function Total({
  term,
  cents,
  muted = false,
}: {
  term: string
  cents: number
  muted?: boolean
}) {
  return (
    <div
      className={`flex justify-between ${muted ? 'text-ink-soft' : 'text-ink'}`}
    >
      <dt>{term}</dt>
      <dd>{formatCents(cents, { alwaysCents: true })}</dd>
    </div>
  )
}

function lineTotal(item: Order['items'][number]) {
  const fees = item.optionsSelected.reduce(
    (n, option) => n + (option.feeAmountCents ?? 0),
    0,
  )
  return (item.unitPriceCents + fees) * item.quantity
}
