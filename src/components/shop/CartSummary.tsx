import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckoutButton } from '#/components/shop/CheckoutButton'
import { Eyebrow } from '#/components/ui'
import {
  ApiError,
  BLOCKER_HINT,
  isNetworkError,
  validatePromoCode,
} from '#/lib/shop/api'
import {
  discountCentsFrom,
  fulfilmentNote,
  fulfilmentOptions,
  minOrderCents,
  promoItems,
  unitPriceCents,
} from '#/lib/shop/checkout'
import type { Fulfilment } from '#/lib/shop/checkout'
import { formatCents, gstComponent } from '#/lib/shop/money'
import type { CartRow } from '#/components/shop/CartLineItem'
import type { Product, Store } from '#/lib/shop/types'

type PromoState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'applied'; discountCents: number | null }
  | { kind: 'error'; message: string }

function Row({
  label,
  value,
  strong = false,
}: {
  label: ReactNode
  value: ReactNode
  strong?: boolean
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1.5 ${
        strong ? 'text-[1.15rem] text-green' : 'text-[0.98rem]'
      }`}
    >
      <span className={strong ? '' : 'text-ink-soft'}>{label}</span>
      <span className="tabular-nums whitespace-nowrap">{value}</span>
    </div>
  )
}

/**
 * Totals, promo code and the checkout hand-off. Never prices delivery — SupplyWise
 * does that during checkout (storefront guide §8 A6).
 */
export function CartSummary({
  store,
  rows,
  byId,
  promoCode,
  setPromoCode,
  fulfilment,
  setFulfilment,
  onProductsRefreshed,
}: {
  store: Store
  rows: CartRow[]
  byId: Map<string, Product>
  promoCode: string | null
  setPromoCode: (code: string | null) => void
  fulfilment: Fulfilment | null
  setFulfilment: (f: Fulfilment) => void
  onProductsRefreshed: (products: Product[]) => void
}) {
  const [draft, setDraft] = useState('')
  const [promo, setPromo] = useState<PromoState>({ kind: 'idle' })

  const buyable = rows.filter((r) => r.status === 'ok' && r.product)
  const unusable = rows.length - buyable.length
  const lines = buyable.map((r) => r.line)
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  let subtotal = 0
  let gstInclusive = 0
  for (const row of buyable) {
    const product = row.product
    if (!product) continue
    const total = unitPriceCents(row.line, product) * row.line.quantity
    subtotal += total
    if (product.chargeGst) gstInclusive += total
  }
  const gst = gstComponent(gstInclusive)

  const items = promoItems(lines, byId)
  const signature = JSON.stringify(items)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const check = useCallback(
    async (code: string, persist: boolean) => {
      setPromo({ kind: 'checking' })
      try {
        const result = await validatePromoCode({
          promoCode: code,
          items: itemsRef.current,
        })
        if (import.meta.env.DEV) {
          // The `cartDiscount` shape is undocumented; log it so it can be read.
          console.info('[promo] response', result)
        }
        if (result.status === 'applied') {
          setPromo({
            kind: 'applied',
            discountCents: discountCentsFrom(result.cartDiscount),
          })
          if (persist) setPromoCode(code)
        } else {
          setPromo({
            kind: 'error',
            message: result.error ?? `“${code}” is not a valid code.`,
          })
        }
      } catch (err) {
        console.error('[promo] validation failed', err)
        setPromo({
          kind: 'error',
          message: isNetworkError(err)
            ? BLOCKER_HINT
            : err instanceof ApiError
              ? err.message
              : 'We could not check that code just now. Please try again.',
        })
      }
    },
    [setPromoCode],
  )

  // Re-validate a saved code whenever the cart contents change, so the discount
  // shown always matches what SupplyWise will apply.
  useEffect(() => {
    if (!promoCode || itemsRef.current.length === 0) {
      setPromo({ kind: 'idle' })
      return
    }
    void check(promoCode, false)
  }, [promoCode, signature, check])

  const discount =
    promo.kind === 'applied' && promo.discountCents ? promo.discountCents : 0
  const total = Math.max(0, subtotal - discount)

  const options = fulfilmentOptions(store.shipping)
  const minOrder = minOrderCents(store.shipping, fulfilment)
  const shortfall = minOrder > 0 ? minOrder - subtotal : 0

  const blockedReason =
    unusable > 0
      ? `Remove the ${unusable === 1 ? 'item' : `${unusable} items`} marked above to continue.`
      : lines.length === 0
        ? 'There is nothing in your cart to check out.'
        : shortfall > 0
          ? `Orders start at ${formatCents(minOrder)}. Add ${formatCents(
              shortfall,
              { alwaysCents: true },
            )} more to check out.`
          : null

  return (
    <aside className="frame-card p-6 sm:p-7">
      <Eyebrow green>Order summary</Eyebrow>
      <h2 className="mt-2 text-[1.5rem]">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </h2>

      <div className="mt-4 border-t border-gold-soft pt-3">
        <Row
          label="Subtotal"
          value={formatCents(subtotal, { alwaysCents: true })}
        />
        {gst > 0 ? (
          <p className="text-[0.85rem] text-ink-soft">
            Includes GST {formatCents(gst, { alwaysCents: true })}
          </p>
        ) : null}
      </div>

      {/* Promo code */}
      <div className="mt-5 border-t border-gold-soft pt-4">
        {promo.kind === 'applied' && promoCode ? (
          <div className="text-[0.95rem]">
            <p className="text-green">
              Promo code <span className="tracking-wide">{promoCode}</span>{' '}
              applied.
            </p>
            {promo.discountCents ? null : (
              <p className="mt-1 text-ink-soft">
                Your discount is calculated and shown at checkout.
              </p>
            )}
            <button
              type="button"
              className="mt-2 text-[0.82rem] tracking-nav text-ink-soft uppercase hover:text-red"
              onClick={() => {
                setPromoCode(null)
                setDraft('')
                setPromo({ kind: 'idle' })
              }}
            >
              Remove code
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const code = draft.trim()
              if (code) void check(code, true)
            }}
          >
            <label
              htmlFor="promo-code"
              className="block text-[0.78rem] tracking-eyebrow text-ink-soft uppercase"
            >
              Promo code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo-code"
                name="promo-code"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter a code"
                className="min-w-0 flex-1 border border-gold-soft bg-ivory px-3 py-2 text-[0.95rem] focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="btn px-5 py-2 disabled:opacity-50"
                disabled={promo.kind === 'checking' || draft.trim() === ''}
              >
                {promo.kind === 'checking' ? 'Checking' : 'Apply'}
              </button>
            </div>
          </form>
        )}
        <p aria-live="polite" className="empty:hidden">
          {promo.kind === 'error' ? (
            <span className="mt-2 block text-[0.9rem] text-red">
              {promo.message}
            </span>
          ) : null}
        </p>
      </div>

      {/* Fulfilment: only a choice when the supplier offers both. */}
      {options.length > 1 ? (
        <fieldset className="mt-5 border-t border-gold-soft pt-4">
          <legend className="text-[0.78rem] tracking-eyebrow text-ink-soft uppercase">
            How would you like it?
          </legend>
          <div className="mt-2 space-y-1.5">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-[0.95rem]"
              >
                <input
                  type="radio"
                  name="fulfilment"
                  value={option}
                  checked={fulfilment === option}
                  onChange={() => setFulfilment(option)}
                  className="accent-green"
                />
                {option === 'pickup' ? 'Pickup from the shop' : 'Delivery'}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-5 border-t border-gold-soft pt-3">
        {discount > 0 ? (
          <Row
            label="Promo discount"
            value={`− ${formatCents(discount, { alwaysCents: true })}`}
          />
        ) : null}
        <p className="py-1.5 text-[0.95rem] text-ink-soft">
          {fulfilmentNote(store.shipping, fulfilment)}
        </p>
        <div className="mt-1 border-t border-gold-soft pt-3">
          <Row
            label="Total"
            value={formatCents(total, { alwaysCents: true })}
            strong
          />
        </div>
      </div>

      <CheckoutButton
        lines={lines}
        byId={byId}
        promoCode={promo.kind === 'applied' ? promoCode : null}
        fulfilment={fulfilment}
        notification={store.checkout.beforeOrderNotification}
        blockedReason={blockedReason}
        onProductsRefreshed={onProductsRefreshed}
      />
    </aside>
  )
}
