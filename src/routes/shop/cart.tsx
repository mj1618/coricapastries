import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { CartLineItem } from '#/components/shop/CartLineItem'
import type { CartRow } from '#/components/shop/CartLineItem'
import { CartPickupPanel } from '#/components/shop/CartPickupPanel'
import { CartSummary } from '#/components/shop/CartSummary'
import { ButtonLink, Eyebrow, PageHero } from '#/components/ui'
import { seo } from '#/lib/seo'
import { parentByProductId } from '#/lib/shop/catalog'
import { useCart } from '#/lib/shop/cart'
import { fulfilmentOptions, maxNoticeDays } from '#/lib/shop/checkout'
import type { Fulfilment } from '#/lib/shop/checkout'
import type { Product } from '#/lib/shop/types'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/cart')({
  head: () =>
    seo({
      title: 'Your cart',
      description:
        'Review your Corica Pastries order and check out. Orders are collected from 106 Aberdeen Street, Northbridge.',
      path: '/shop/cart',
      noindex: true,
    }),
  component: Page,
})

function Page() {
  const { store } = shopRoute.useLoaderData()
  const cart = useCart()

  // Starts as the snapshot the page was rendered with, and is replaced by the
  // fresh list the checkout step fetches, so prices on screen stay truthful.
  const [products, setProducts] = useState<Product[]>(store.products)
  useEffect(() => setProducts(store.products), [store.products])

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )
  const parents = useMemo(() => parentByProductId(store), [store])

  const options = useMemo(
    () => fulfilmentOptions(store.shipping),
    [store.shipping],
  )
  const [fulfilment, setFulfilment] = useState<Fulfilment | null>(
    options[0] ?? null,
  )

  const rows = useMemo<CartRow[]>(
    () =>
      cart.lines.map((line) => {
        const product = byId.get(line.productId) ?? null
        const group = parents.get(line.productId) ?? null
        return {
          line,
          product,
          group,
          variantName:
            group?.products.find((m) => m.productId === line.productId)
              ?.displayName ?? null,
          status: !product
            ? 'removed'
            : !product.inStock || product.stockStatus === 'out-of-stock'
              ? 'sold-out'
              : 'ok',
        }
      }),
    [cart.lines, byId, parents],
  )

  const noticeDays = maxNoticeDays(
    rows.filter((r) => r.status === 'ok').map((r) => r.line),
    byId,
  )

  return (
    <>
      <PageHero
        eyebrow="Your cart"
        title="Almost there."
        lede={
          <>
            Orders are collected from the shop at 106 Aberdeen Street,
            Northbridge. You choose your pickup day at checkout.
          </>
        }
      />

      <section className="py-12 md:py-16">
        <div className="wrap">
          {!cart.hydrated ? (
            <CartSkeleton />
          ) : rows.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
              <div className="lg:col-start-1 lg:row-start-1">
                <h2 className="sr-only">Items in your cart</h2>
                <ul className="space-y-5">
                  {rows.map((row) => (
                    <CartLineItem
                      key={row.line.key}
                      row={row}
                      supplierLogo={store.supplier.image}
                      onQuantity={cart.setQuantity}
                      onRemove={cart.remove}
                    />
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <Link to="/shop" className="link-gold text-[0.98rem]">
                    &larr; Continue shopping
                  </Link>
                  <button
                    type="button"
                    onClick={cart.clear}
                    className="text-[0.82rem] tracking-nav text-ink-soft uppercase hover:text-red"
                  >
                    Empty cart
                  </button>
                </div>
              </div>

              <div className="lg:col-start-2 lg:row-start-1">
                <div className="lg:sticky lg:top-28">
                  <CartSummary
                    store={store}
                    rows={rows}
                    byId={byId}
                    promoCode={cart.promoCode}
                    setPromoCode={cart.setPromoCode}
                    fulfilment={fulfilment}
                    setFulfilment={setFulfilment}
                    onProductsRefreshed={setProducts}
                  />
                </div>
              </div>

              <div className="lg:col-start-1 lg:row-start-2 lg:max-w-[34rem]">
                <CartPickupPanel
                  store={store}
                  fulfilment={fulfilment}
                  noticeDays={noticeDays}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

/** Shown until localStorage has been read, so server and client HTML match. */
function CartSkeleton() {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10"
      aria-busy="true"
    >
      <p className="sr-only" role="status">
        Loading your cart.
      </p>
      <div className="space-y-5" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="frame-card p-4 sm:p-6">
            <div className="flex gap-4 sm:gap-6">
              <div className="h-20 w-20 bg-cream-deep sm:h-28 sm:w-28" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 w-2/3 bg-cream-deep" />
                <div className="h-4 w-1/3 bg-cream-deep" />
                <div className="h-9 w-32 bg-cream-deep" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="frame-card p-6 sm:p-7" aria-hidden="true">
        <div className="h-4 w-28 bg-cream-deep" />
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full bg-cream-deep" />
          <div className="h-4 w-2/3 bg-cream-deep" />
          <div className="h-11 w-full bg-cream-deep" />
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="frame-card mx-auto max-w-[36rem] p-8 text-center sm:p-12">
      <Eyebrow green>Nothing here yet</Eyebrow>
      <h2 className="mt-2 text-[2rem]">Your cart is empty.</h2>
      <p className="mt-4 text-ink-soft">
        Strudels, tortas, cannoli and the rest of the cabinet are waiting in the
        shop. Add what you would like and collect it from Aberdeen Street.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-4">
        <ButtonLink to="/shop" variant="solid">
          Browse the shop
        </ButtonLink>
        <ButtonLink to="/patisserie">See the patisserie</ButtonLink>
      </div>
    </div>
  )
}
