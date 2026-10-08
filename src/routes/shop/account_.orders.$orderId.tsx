import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useCallback } from 'react'
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
import {
  OrderAddress,
  OrderItems,
  OrderRow,
  OrderTotals,
} from '#/components/shop/OrderParts'
import { Eyebrow, Ornament, PageHero } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import { getOrder, useAuth } from '#/lib/shop/auth'
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
          <OrderRow term="Fulfilment">
            <span className="capitalize">
              {humanise(order.pickupOrDelivery)}
            </span>
          </OrderRow>
        ) : null}
        {when ? (
          <OrderRow
            term={
              order.pickupOrDelivery === 'pickup'
                ? 'Pickup date'
                : 'Delivery date'
            }
          >
            {when}
          </OrderRow>
        ) : null}
        {order.invoiceReference ? (
          <OrderRow term="Invoice">{order.invoiceReference}</OrderRow>
        ) : null}
        {order.pickupOrDelivery === 'pickup' ? (
          <OrderRow term="Collect from">{fullAddress}</OrderRow>
        ) : order.shippingAddress ? (
          <OrderRow term="Delivering to">
            <OrderAddress address={order.shippingAddress} />
          </OrderRow>
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

/* ------------------------------------------------------------------ invoice */

function Invoice({ order, store }: { order: Order; store: Store }) {
  const supplier = store.supplier
  // The guide documents `totals`, but a partial response could omit it.
  const totals = order.totals as Order['totals'] | undefined
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
          <OrderRow term="Invoice number">{order.invoiceReference}</OrderRow>
        ) : null}
        {order.orderReference ? (
          <OrderRow term="Order reference">{order.orderReference}</OrderRow>
        ) : null}
        {placed ? <OrderRow term="Issued">{placed}</OrderRow> : null}
        {totals?.promoCodeApplied ? (
          <OrderRow term="Promo code">{totals.promoCodeApplied}</OrderRow>
        ) : null}
      </dl>

      <OrderItems items={order.items} />
      <OrderTotals order={order} />

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
