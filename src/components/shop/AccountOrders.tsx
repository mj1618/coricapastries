import { Link } from '@tanstack/react-router'
import {
  AccountBadge,
  AccountNotice,
  AccountSection,
  AccountSkeleton,
  formatDay,
  formatTimestamp,
  humanise,
  useAccountResource,
} from '#/components/shop/AccountUi'
import { getOrders } from '#/lib/shop/auth'
import { formatCents } from '#/lib/shop/money'
import type { OrderSummary } from '#/lib/shop/types'

/** Order history: newest first, each row linking to the full order and tax invoice. */
export function AccountOrders() {
  const { status, data, error, reload } = useAccountResource(
    getOrders,
    'Could not load your orders.',
  )
  const orders = data?.orders ?? []

  return (
    <AccountSection
      id="orders"
      eyebrow="History"
      title="Your orders"
      lede="Every order placed with this account, most recent first."
    >
      {status === 'loading' ? (
        <AccountSkeleton rows={3} />
      ) : status === 'error' ? (
        <AccountNotice tone="warning">
          <p>{error}</p>
          <p className="mt-4">
            <button type="button" className="btn" onClick={() => void reload()}>
              Try again
            </button>
          </p>
        </AccountNotice>
      ) : orders.length === 0 ? (
        <AccountNotice>
          <p>No orders yet.</p>
          <p className="mt-4">
            <Link to="/shop" className="btn btn-solid">
              Browse the shop
            </Link>
          </p>
        </AccountNotice>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </AccountSection>
  )
}

function OrderRow({ order }: { order: OrderSummary }) {
  const placed = formatTimestamp(order.createdAt)
  const fulfilment = order.pickupOrDelivery
    ? humanise(order.pickupOrDelivery)
    : null
  const when = formatDay(order.deliveryDate)

  return (
    <li className="frame-card px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-[1.35rem] text-green">
            {order.orderReference ? `Order ${order.orderReference}` : 'Order'}
          </h3>
          <p className="mt-1 text-[1rem] text-ink-soft">
            {placed ? `Placed ${placed}` : null}
            {fulfilment ? ` · ${fulfilment}` : null}
            {when ? ` · ${when}` : null}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AccountBadge label="Payment" status={order.paymentStatus} />
            <AccountBadge label="Order" status={order.shippingStatus} />
            {order.orderStatus && order.orderStatus !== 'active' ? (
              <AccountBadge status={order.orderStatus} />
            ) : null}
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="font-display text-[1.6rem] text-green">
            {formatCents(order.totalIncGstCents)}
          </p>
          <p className="mt-3">
            <Link
              to="/shop/account/orders/$orderId"
              params={{ orderId: order.id }}
              className="btn"
            >
              View order
            </Link>
          </p>
        </div>
      </div>
    </li>
  )
}
