import { useState } from 'react'
import { createCheckout, getProducts } from '#/lib/shop/api'
import { checkoutErrorMessage, reconcile } from '#/lib/shop/checkout'
import type { CartChange, Fulfilment } from '#/lib/shop/checkout'
import { formatCents } from '#/lib/shop/money'
import { site } from '#/data/site'
import type { CartLine, Product } from '#/lib/shop/types'

type Phase = 'idle' | 'notify' | 'pending' | 'review' | 'blocked' | 'error'

function changeText(change: CartChange) {
  switch (change.kind) {
    case 'removed':
      return `${change.name} is no longer available.`
    case 'out-of-stock':
      return `${change.name} has sold out.`
    case 'price':
      return `${change.name} is now ${formatCents(change.toCents, {
        alwaysCents: true,
      })} (was ${formatCents(change.fromCents, { alwaysCents: true })}).`
  }
}

/**
 * The checkout hand-off. Confirms the supplier's pre-order notice if there is one,
 * re-checks prices and stock against a fresh product list, then POSTs the cart to
 * SupplyWise and redirects to the returned `checkoutUrl`. The cart is deliberately
 * left intact — the shopper may come back.
 */
export function CheckoutButton({
  lines,
  byId,
  promoCode,
  fulfilment,
  notification,
  blockedReason,
  onProductsRefreshed,
}: {
  /** Only the lines that can actually be bought (product exists and is in stock). */
  lines: CartLine[]
  byId: Map<string, Product>
  promoCode: string | null
  fulfilment: Fulfilment | null
  notification: string | null
  /** Non-null keeps the button disabled and explains why. */
  blockedReason: string | null
  onProductsRefreshed: (products: Product[]) => void
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [changes, setChanges] = useState<CartChange[]>([])
  const [error, setError] = useState<string | null>(null)
  const busy = phase === 'pending'

  async function run() {
    setPhase('pending')
    setError(null)
    setChanges([])
    try {
      const { products } = await getProducts()
      const result = reconcile(lines, products, byId)
      onProductsRefreshed(products)
      if (result.changes.length > 0) {
        setChanges(result.changes)
        // Something can't be bought: stop and let the shopper fix the cart.
        if (result.unavailable) {
          setPhase('blocked')
          return
        }
        // Prices moved: show what changed and make them press again.
        setPhase('review')
        return
      }

      const checkout = await createCheckout({
        items: lines.map(({ key: _key, ...item }) => item),
        promoCode: promoCode ?? undefined,
        pickupOrDelivery: fulfilment ?? undefined,
      })
      // Stay "pending" through the redirect so the button cannot be pressed twice.
      window.location.assign(checkout.checkoutUrl)
    } catch (err) {
      console.error('[checkout] hand-off failed', err)
      setError(checkoutErrorMessage(err))
      setPhase('error')
    }
  }

  function start() {
    if (blockedReason) return
    if (notification && phase === 'idle') {
      setPhase('notify')
      return
    }
    void run()
  }

  const label = busy
    ? 'Starting checkout…'
    : phase === 'review'
      ? 'Continue to checkout'
      : 'Checkout'

  return (
    <div className="mt-5">
      {phase === 'notify' && notification ? (
        <div className="border border-gold-soft bg-cream-deep/60 p-4 text-[0.95rem]">
          <p className="text-ink">{notification}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-solid flex-1"
              onClick={() => void run()}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn flex-1"
              onClick={() => setPhase('idle')}
            >
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-solid w-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={start}
          disabled={busy || !!blockedReason}
          aria-describedby="checkout-status"
        >
          {label}
        </button>
      )}

      <div id="checkout-status" aria-live="polite" className="empty:hidden">
        {blockedReason ? (
          <p className="mt-3 text-[0.95rem] text-red">{blockedReason}</p>
        ) : null}

        {changes.length > 0 ? (
          <div className="mt-3 border border-gold-soft bg-cream-deep/60 p-4 text-[0.95rem]">
            <p className="text-ink">
              {phase === 'blocked'
                ? 'Your cart changed while you were shopping:'
                : 'Prices have changed since you added these:'}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
              {changes.map((c) => (
                <li key={`${c.kind}-${c.key}`}>{changeText(c)}</li>
              ))}
            </ul>
            {phase === 'review' ? (
              <p className="mt-2 text-ink-soft">
                The totals above are up to date. Press checkout again to
                continue.
              </p>
            ) : (
              <p className="mt-2 text-ink-soft">
                Remove the items above to continue.
              </p>
            )}
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 border border-red/40 bg-red/5 p-4 text-[0.95rem]">
            <p className="text-red">{error}</p>
            <p className="mt-2 text-ink-soft">
              You can also order by phone on{' '}
              <a href={site.phone.href} className="link-gold">
                {site.phone.display}
              </a>
              .
            </p>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-[0.85rem] text-ink-soft italic">
        Payment and pickup details are completed securely on SupplyWise, our
        ordering system. Your cart stays here if you come back.
      </p>
    </div>
  )
}
