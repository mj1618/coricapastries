import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import {
  AccountBadge,
  AccountNotice,
  AccountSkeleton,
  formatDay,
  optionalText,
} from '#/components/shop/AccountUi'
import {
  OrderAddress,
  OrderItems,
  OrderRow,
  OrderTotals,
} from '#/components/shop/OrderParts'
import { ButtonLink, Eyebrow, Ornament, PageHero } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import { trackPurchase } from '#/lib/analytics'
import { ApiError, getOrderConfirmation } from '#/lib/shop/api'
import { useAuth } from '#/lib/shop/auth'
import { useCart } from '#/lib/shop/cart'
import { describeTime } from '#/lib/shop/checkout'
import {
  CONFIRMATION_PATH,
  firstConfirmation,
  readConfirmationToken,
} from '#/lib/shop/confirmation'
import type { ConfirmedOrder } from '#/lib/shop/types'
import { seo } from '#/lib/seo'

/**
 * Where SupplyWise's hosted checkout sends the shopper once an order is paid:
 * `/shop/order-confirmation?token=…` (the path is fixed by SupplyWise). The token
 * reads the order without a login, so it is kept out of the URL, analytics and
 * referrers; the order itself is only ever fetched in the browser.
 */
export const Route = createFileRoute('/shop/order-confirmation')({
  head: () => {
    const head = seo({
      title: 'Your order',
      description: 'Confirmation of an order placed with Corica Pastries.',
      path: CONFIRMATION_PATH,
      noindex: true,
    })
    return {
      ...head,
      meta: [...head.meta, { name: 'referrer', content: 'no-referrer' }],
    }
  },
  // Overrides the shop layout's shared cache: the request URL carries the token.
  headers: () => ({
    'cache-control': 'private, no-store',
    'referrer-policy': 'no-referrer',
  }),
  component: Page,
})

type State =
  | { status: 'loading' }
  | { status: 'ready'; order: ConfirmedOrder }
  /** No token, or SupplyWise no longer knows it (404, or 410 after 24 hours). */
  | { status: 'unavailable' }
  /** The request itself failed; the order may well be fine. */
  | { status: 'error' }

function Page() {
  const cart = useCart()
  const clearCart = cart.clear
  const [state, setState] = useState<State>({ status: 'loading' })

  const load = useCallback(async () => {
    const token = readConfirmationToken()
    if (!token) {
      setState({ status: 'unavailable' })
      return
    }
    setState({ status: 'loading' })
    try {
      const order = await getOrderConfirmation(token)
      // A 200 is the only signal that the order went through. Act on it once per
      // order: a reload must not empty a cart started since, or count twice.
      if (firstConfirmation(order.id)) {
        clearCart()
        trackPurchase(order)
      }
      setState({ status: 'ready', order })
    } catch (err) {
      const gone =
        err instanceof ApiError && (err.status === 404 || err.status === 410)
      // Deliberately not logging the error's URL or the token.
      console.error(
        '[order-confirmation] could not load the order',
        err instanceof ApiError ? err.code : 'network',
      )
      setState({ status: gone ? 'unavailable' : 'error' })
    }
  }, [clearCart])

  useEffect(() => {
    void load()
  }, [load])

  const order = state.status === 'ready' ? state.order : null
  const email = optionalText(order?.customer?.email)

  return (
    <>
      <PageHero
        eyebrow={order ? 'Order confirmed' : 'Your order'}
        title={
          order
            ? 'Thank you for your order'
            : state.status === 'loading'
              ? 'Your order'
              : "We couldn't load this order"
        }
        lede={
          order
            ? email
              ? `We've emailed your confirmation and tax invoice to ${email}.`
              : "We've emailed your confirmation and tax invoice."
            : undefined
        }
      />

      <div className="wrap max-w-[900px] py-14 md:py-20">
        {state.status === 'loading' ? (
          <AccountSkeleton rows={4} />
        ) : order ? (
          <Confirmation order={order} />
        ) : (
          <AccountNotice>
            <p>
              {state.status === 'error'
                ? "We couldn't load this order just now. Your payment is not affected: check your email for your confirmation."
                : "We couldn't load this order. Check your email for your confirmation."}
            </p>
            <p className="mt-2">
              If it hasn't arrived, call us on{' '}
              <a href={site.phone.href} className="link-gold">
                {site.phone.display}
              </a>
              .
            </p>
            <p className="mt-5 flex flex-wrap justify-center gap-3">
              {state.status === 'error' ? (
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => void load()}
                >
                  Try again
                </button>
              ) : null}
              <Link to="/shop" className="btn">
                Back to the shop
              </Link>
            </p>
          </AccountNotice>
        )}
      </div>
    </>
  )
}

function Confirmation({ order }: { order: ConfirmedOrder }) {
  const { status } = useAuth()
  const pickup = order.pickupOrDelivery !== 'delivery'
  const when = formatDay(order.deliveryDate)
  const slot = order.pickupWindow
  const name = optionalText(order.customer?.name)

  return (
    <div className="space-y-12">
      <section className="frame-card px-6 py-8 sm:px-9">
        <div className="text-center">
          <Eyebrow>{pickup ? 'Pickup' : 'Delivery'}</Eyebrow>
          <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.1rem)]">
            {order.orderReference
              ? `Order ${order.orderReference}`
              : 'Your order'}
          </h2>
          <Ornament />
          {/* "paid" and "paid-awaiting-settlement" both mean the shopper has paid. */}
          <AccountBadge label="Payment" status="paid" />
        </div>

        <dl className="mx-auto mt-7 grid max-w-[640px] gap-x-8 gap-y-3 sm:grid-cols-2">
          {name ? <OrderRow term="Name">{name}</OrderRow> : null}
          {when ? (
            <OrderRow term={pickup ? 'Pickup date' : 'Delivery date'}>
              {when}
            </OrderRow>
          ) : null}
          {pickup && slot?.start && slot.end ? (
            <OrderRow term="Pickup time">
              {describeTime(slot.start)} to {describeTime(slot.end)}
            </OrderRow>
          ) : null}
          {pickup ? (
            <OrderRow term="Collect from">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-gold"
              >
                {fullAddress}
              </a>
            </OrderRow>
          ) : order.shippingAddress ? (
            <OrderRow term="Delivering to">
              <OrderAddress address={order.shippingAddress} />
            </OrderRow>
          ) : null}
        </dl>
      </section>

      <section className="frame-card px-6 py-9 sm:px-10">
        <div className="text-center">
          <Eyebrow green>Your order</Eyebrow>
          <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.1rem)]">
            What you ordered
          </h2>
          <Ornament />
        </div>
        <OrderItems items={order.items} />
        <OrderTotals order={order} />
      </section>

      <div className="text-center">
        <p className="text-ink-soft">
          Questions about your order? Call us on{' '}
          <a href={site.phone.href} className="link-gold">
            {site.phone.display}
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/shop" variant="solid">
            Back to the shop
          </ButtonLink>
          {status === 'authenticated' ? (
            <Link
              to="/shop/account/orders/$orderId"
              params={{ orderId: order.id }}
              className="btn"
            >
              View in your account
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
