import { useEffect, useRef, useState } from 'react'
import { cartItems, trackEcommerce } from '#/lib/analytics'
import { createCheckout, getProducts } from '#/lib/shop/api'
import { useCart } from '#/lib/shop/cart'
import { checkoutErrorMessage, reconcile } from '#/lib/shop/checkout'
import type { CartChange, Fulfilment } from '#/lib/shop/checkout'
import { formatCents } from '#/lib/shop/money'
import { Eyebrow } from '#/components/ui'
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
    case 'quantity':
      return change.available > 0
        ? `Only ${change.available} of ${change.name} available — we've updated your cart.`
        : `${change.name} has sold out — we've updated your cart.`
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
  const { setQuantity } = useCart()
  const [phase, setPhase] = useState<Phase>('idle')
  const [changes, setChanges] = useState<CartChange[]>([])
  const [error, setError] = useState<string | null>(null)
  const busy = phase === 'pending'

  async function run() {
    setPhase('pending')
    setError(null)
    setChanges([])
    try {
      // The re-check is a courtesy, not a gate: if the product list cannot be
      // fetched, hand the cart over as it is and let SupplyWise have the last word.
      const products = await getProducts().then(
        (r) => r.products,
        (err) => {
          console.warn('[checkout] could not re-check the cart', err)
          return null
        },
      )
      const result = products ? reconcile(lines, products, byId) : null
      if (products) onProductsRefreshed(products)
      if (result && result.changes.length > 0) {
        setChanges(result.changes)
        // Something can't be bought: stop and let the shopper fix the cart.
        if (result.unavailable) {
          setPhase('blocked')
          return
        }
        // More in the cart than is in stock: lower those lines (0 removes one).
        for (const change of result.changes) {
          if (change.kind !== 'quantity') continue
          for (const line of change.lines) setQuantity(line.key, line.quantity)
        }
        // Prices or quantities moved: show what changed and make them press
        // again. That press runs with the lowered lines, never the ones above.
        setPhase('review')
        return
      }

      trackEcommerce('begin_checkout', cartItems(lines, byId))
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
      <button
        type="button"
        className="btn btn-solid w-full disabled:cursor-not-allowed disabled:opacity-50"
        onClick={start}
        disabled={busy || !!blockedReason}
        aria-describedby="checkout-status"
      >
        {label}
      </button>

      {notification ? (
        <NoticeDialog
          open={phase === 'notify'}
          text={notification}
          onContinue={() => void run()}
          onCancel={() => setPhase('idle')}
        />
      ) : null}

      <div id="checkout-status" aria-live="polite" className="empty:hidden">
        {blockedReason ? (
          <p className="mt-3 text-[0.95rem] text-red">{blockedReason}</p>
        ) : null}

        {changes.length > 0 ? (
          <div className="mt-3 border border-gold-soft bg-cream-deep/60 p-4 text-[0.95rem]">
            <p className="text-ink">
              {phase === 'blocked' || changes.some((c) => c.kind === 'quantity')
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

/**
 * The supplier's pre-order notice as a modal. It used to open inline under the
 * cart summary, where a long notice ran below the fold and shoppers missed it.
 * A native <dialog> gives the focus trap, Escape and backdrop for free.
 */
function NoticeDialog({
  open,
  text,
  onContinue,
  onCancel,
}: {
  open: boolean
  text: string
  onContinue: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="checkout-notice-title"
      // Escape closes the dialog natively; keep the phase in step with it.
      onClose={() => {
        if (open) onCancel()
      }}
      // A click on the dialog element itself is a click on the backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-gold-soft bg-ivory p-0 text-ink shadow-2xl backdrop:bg-green-deep/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="overflow-y-auto px-6 pt-7 pb-5 sm:px-9">
          <div className="text-center">
            <Eyebrow>Before you order</Eyebrow>
            <h2
              id="checkout-notice-title"
              className="mt-2 text-[clamp(1.5rem,3vw,1.9rem)]"
            >
              Please note
            </h2>
          </div>
          <p className="mt-4 text-[1.05rem] whitespace-pre-line">{text}</p>
        </div>
        <div className="flex flex-col gap-3 border-t border-gold-soft px-6 py-4 sm:flex-row sm:px-9">
          <button
            type="button"
            className="btn btn-solid flex-1"
            onClick={onContinue}
          >
            Continue to checkout
          </button>
          <button type="button" className="btn flex-1" onClick={onCancel}>
            Not yet
          </button>
        </div>
      </div>
    </dialog>
  )
}
