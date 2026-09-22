import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { ReactNode } from 'react'
import { AccountSync } from '#/components/shop/AccountSync'
import {
  AccountBadge,
  AccountNotice,
  AccountSkeleton,
  formatDay,
  formatTimestamp,
  humanise,
  useAccountResource,
} from '#/components/shop/AccountUi'
import { Eyebrow, Ornament, PageHero } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import { getOrder, useAuth } from '#/lib/shop/auth'
import { formatCents } from '#/lib/shop/money'
import type { Order, Store } from '#/lib/shop/types'
import { seo } from '#/lib/seo'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/account_/orders/$orderId')({
  // The access token lives in localStorage, so this page can only be rendered in the
  // browser — nothing about it is server-renderable or indexable.
  ssr: false,
  head: ({ params }) =>
    seo({
      title: 'Your order',
      description:
        'Order details and tax invoice for an order placed with Corica Pastries.',
      path: `/shop/account/orders/${params.orderId}`,
      noindex: true,
    }),
  component: Page,
})

const PRINT_CSS = `
@media print {
  header, footer, .no-print { display: none !important; }
  body { background: #fff; }
  .frame-card::before { display: none; }
  .invoice { border: 0; }
}
`

function Page() {
  const { orderId } = Route.useParams()
  const { store } = shopRoute.useLoaderData()
  const { status, login } = useAuth()

  return (
    <>
      <AccountSync />
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <PageHero
        eyebrow="Your account"
        title="Order details"
        lede="Everything on this order, plus a tax invoice you can print."
      />

      <div className="wrap max-w-[900px] py-14 md:py-20">
        <p className="no-print mb-8">
          <Link to="/shop/account" className="link-gold">
            ← Back to your account
          </Link>
        </p>

        {status === 'loading' ? (
          <AccountSkeleton rows={4} />
        ) : status === 'anonymous' ? (
          <AccountNotice>
            <p>Please log in to view this order.</p>
            <p className="mt-4">
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => void login()}
              >
                Log in with SupplyWise
              </button>
            </p>
          </AccountNotice>
        ) : (
          <OrderDetail orderId={orderId} store={store} />
        )}
      </div>
    </>
  )
}

function OrderDetail({ orderId, store }: { orderId: string; store: Store }) {
  const load = useCallback(() => getOrder(orderId), [orderId])
  const { status, data, error, reload } = useAccountResource(
    load,
    'Could not load this order.',
  )

  if (status === 'loading') return <AccountSkeleton rows={4} />
  if (status === 'error' || !data) {
    return (
      <AccountNotice tone="warning">
        <p>{error ?? 'Could not load this order.'}</p>
        <p className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn" onClick={() => void reload()}>
            Try again
          </button>
          <Link to="/shop/account" className="btn">
            Back to your account
          </Link>
        </p>
      </AccountNotice>
    )
  }

  return (
    <div className="space-y-12">
      <StatusCard order={data} />
      <Invoice order={data} store={store} />
    </div>
  )
}

/* ---------------------------------------------------------- status & tracking */

function StatusCard({ order }: { order: Order }) {
  const placed = formatTimestamp(order.createdAt)
  const when = formatDay(order.deliveryDate)
  // Heavy orders ship as several parcels; `trackingNumber`/`trackingUrl` repeat the
  // first one for back-compat, so only fall back to them when `parcels` is missing.
  const tracking = order.tracking
  const parcelList = tracking?.parcels ?? []
  const parcels = parcelList.length
    ? parcelList
    : tracking
      ? [
          {
            trackingNumber: tracking.trackingNumber,
            trackingUrl: tracking.trackingUrl,
          },
        ]
      : []
  const tracked = parcels.filter((p) => p.trackingNumber ?? p.trackingUrl)

  return (
    <section className="frame-card no-print px-6 py-8 sm:px-9">
      <div className="text-center">
        <Eyebrow>Status</Eyebrow>
        <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.1rem)]">
          {order.orderReference
            ? `Order ${order.orderReference}`
            : 'Your order'}
        </h2>
        {placed ? (
          <p className="mt-1 text-ink-soft italic">Placed {placed}</p>
        ) : null}
        <Ornament />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <AccountBadge label="Payment" status={order.paymentStatus} />
        <AccountBadge label="Order" status={order.shippingStatus} />
        {order.orderStatus && order.orderStatus !== 'active' ? (
          <AccountBadge status={order.orderStatus} />
        ) : null}
      </div>

      <dl className="mx-auto mt-7 grid max-w-[640px] gap-x-8 gap-y-3 sm:grid-cols-2">
        {order.pickupOrDelivery ? (
          <Row term="Fulfilment">
            <span className="capitalize">
              {humanise(order.pickupOrDelivery)}
            </span>
          </Row>
        ) : null}
        {when ? (
          <Row
            term={
              order.pickupOrDelivery === 'pickup'
                ? 'Pickup date'
                : 'Delivery date'
            }
          >
            {when}
          </Row>
        ) : null}
        {order.invoiceReference ? (
          <Row term="Invoice">{order.invoiceReference}</Row>
        ) : null}
        {order.pickupOrDelivery === 'pickup' ? (
          <Row term="Collect from">{fullAddress}</Row>
        ) : order.shippingAddress ? (
          <Row term="Delivering to">
            <Address address={order.shippingAddress} />
          </Row>
        ) : null}
      </dl>

      {tracked.length > 0 ? (
        <div className="mt-7 border-t border-gold-soft pt-6 text-center">
          <Eyebrow green>Tracking</Eyebrow>
          <ul className="mt-2 space-y-1">
            {tracked.map((parcel, i) => (
              <li key={i}>
                {parcel.trackingUrl ? (
                  <a
                    href={parcel.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-gold"
                  >
                    {parcel.trackingNumber ?? 'Track this parcel'}
                  </a>
                ) : (
                  <span className="text-ink-soft">{parcel.trackingNumber}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function Row({ term, children }: { term: string; children: ReactNode }) {
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

function Address({ address }: { address: Record<string, string> }) {
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

/* ------------------------------------------------------------------ invoice */

function Invoice({ order, store }: { order: Order; store: Store }) {
  const supplier = store.supplier
  const totals = readTotals(order)
  const placed = formatTimestamp(order.createdAt)

  return (
    <section className="frame-card invoice px-6 py-9 sm:px-10">
      <div className="text-center">
        <Eyebrow green>Tax invoice</Eyebrow>
        <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.1rem)]">
          {supplier.businessName ?? supplier.name}
        </h2>
        <p className="mt-1 text-[1rem] text-ink-soft">
          {supplier.abn ? `ABN ${formatAbn(supplier.abn)}` : null}
        </p>
        <p className="text-[1rem] text-ink-soft">
          {supplier.address
            ? [
                supplier.address.addressLine1,
                supplier.address.addressLine2,
                `${supplier.address.suburb} ${supplier.address.state} ${supplier.address.postcode}`,
              ]
                .filter(Boolean)
                .join(', ')
            : fullAddress}
        </p>
        <p className="text-[1rem] text-ink-soft">
          {formatPhone(supplier.phone) ?? site.phone.display}
          {supplier.email ? ` · ${supplier.email}` : null}
        </p>
        <Ornament />
      </div>

      <dl className="mx-auto mb-8 grid max-w-[560px] gap-x-8 gap-y-3 sm:grid-cols-2">
        {order.invoiceReference ? (
          <Row term="Invoice number">{order.invoiceReference}</Row>
        ) : null}
        {order.orderReference ? (
          <Row term="Order reference">{order.orderReference}</Row>
        ) : null}
        {placed ? <Row term="Issued">{placed}</Row> : null}
        {totals?.promoCodeApplied ? (
          <Row term="Promo code">{totals.promoCodeApplied}</Row>
        ) : null}
      </dl>

      <ul className="border-t border-gold-soft">
        {order.items.map((item, i) => (
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
              <p className="font-display text-[1.2rem] text-green">
                {item.name}
              </p>
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

      {totals ? (
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
            <Total
              term="Delivery (incl. GST)"
              cents={totals.shippingIncGstCents}
            />
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
      )}

      <p className="mt-9 text-center text-[0.95rem] text-ink-soft italic">
        Payment for online orders is taken by SupplyWise on behalf of{' '}
        {supplier.businessName ?? supplier.name}.
      </p>

      <p className="no-print mt-7 text-center">
        <button type="button" className="btn" onClick={() => window.print()}>
          Print this invoice
        </button>
      </p>
    </section>
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

/**
 * The guide documents `totals` on the full order, but an older or partial response
 * could omit it, and the invoice must still render — so treat it as optional.
 */
function readTotals(order: Order): Order['totals'] | undefined {
  return order.totals
}

function lineTotal(item: Order['items'][number]) {
  const fees = item.optionsSelected.reduce(
    (n, option) => n + (option.feeAmountCents ?? 0),
    0,
  )
  return (item.unitPriceCents + fees) * item.quantity
}

/** +61893288196 → (08) 9328 8196; anything unexpected is left alone. */
function formatPhone(phone: string | null) {
  if (!phone) return null
  const local = phone.replace(/\s+/g, '').replace(/^\+61/, '0')
  return /^0\d{9}$/.test(local)
    ? `(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`
    : phone
}

/** 76746368921 → 76 746 368 921. */
function formatAbn(abn: string) {
  const digits = abn.replace(/\D/g, '')
  return digits.length === 11
    ? `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    : abn
}
