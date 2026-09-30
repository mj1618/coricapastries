import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { ShopImage } from '#/components/shop/ShopImage'
import { useCart } from '#/lib/shop/cart'

/**
 * The "Added to your cart" pop-down under the header, after Shopify's Dawn theme: a
 * tick and heading, the item just added, a "View cart (n)" button and a "Continue
 * shopping" link. It stays open until the shopper closes it, clicks elsewhere, presses
 * Escape or navigates. Rendered inside the sticky header, so it is in view wherever
 * the Add button was.
 */
export function CartNotification() {
  const { lastAdded, dismissAdded, count } = useCart()
  const panel = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const seenPath = useRef(pathname)

  // Close when the route changes (e.g. the shopper follows "View cart").
  useEffect(() => {
    if (seenPath.current === pathname) return
    seenPath.current = pathname
    dismissAdded()
  }, [pathname, dismissAdded])

  // Move focus into the panel on every add so screen readers announce it.
  const id = lastAdded?.id
  useEffect(() => {
    if (id === undefined) return
    if (!panel.current?.contains(document.activeElement)) {
      returnFocus.current = document.activeElement as HTMLElement | null
    }
    panel.current?.focus({ preventScroll: true })
  }, [id])

  useEffect(() => {
    if (id === undefined) return
    const close = (restore: boolean) => {
      dismissAdded()
      if (restore) returnFocus.current?.focus({ preventScroll: true })
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(true)
    const onPointer = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node)) close(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [id, dismissAdded])

  if (!lastAdded) return null

  const close = () => {
    dismissAdded()
    returnFocus.current?.focus({ preventScroll: true })
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full">
      <div className="wrap flex justify-end">
        <div
          ref={panel}
          role="dialog"
          aria-label="Added to your cart"
          tabIndex={-1}
          className="pointer-events-auto w-full border border-t-0 border-gold-soft bg-ivory px-5 pt-4 pb-5 shadow-[0_12px_30px_-12px_rgba(0,40,32,0.35)] outline-none sm:max-w-[23rem]"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-[0.75rem] tracking-eyebrow text-green uppercase">
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M2.5 8.5l3.5 3.5 7.5-8" />
              </svg>
              Added to your cart
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-1.5 p-1.5 text-ink-soft hover:text-red"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="w-16 shrink-0 border border-gold-soft">
              <ShopImage src={lastAdded.image} alt="" sizes="64px" priority />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[1.2rem] leading-tight text-green">
                {lastAdded.name}
              </p>
              {lastAdded.details?.map((d) => (
                <p key={d} className="mt-0.5 text-[0.88rem] text-ink-soft">
                  {d}
                </p>
              ))}
              {lastAdded.quantity > 1 ? (
                <p className="mt-0.5 text-[0.88rem] text-ink-soft">
                  Quantity: {lastAdded.quantity}
                </p>
              ) : null}
            </div>
          </div>

          <Link to="/shop/cart" className="btn btn-solid mt-5 w-full">
            View cart ({count})
          </Link>
          <button
            type="button"
            onClick={close}
            className="mx-auto mt-3 block border-b border-gold pb-0.5 text-[0.72rem] tracking-nav text-green uppercase hover:text-red"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  )
}
