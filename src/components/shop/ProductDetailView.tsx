import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { FavouriteButton } from '#/components/shop/FavouriteButton'
import { GalleryViewer } from '#/components/shop/GalleryViewer'
import { ProductDescription } from '#/components/shop/ProductDescription'
import { ProductPurchasePanel } from '#/components/shop/ProductPurchasePanel'
import { Ornament } from '#/components/ui'
import { categorySlug } from '#/lib/shop/catalog'
import { formatCents } from '#/lib/shop/money'
import { site } from '#/data/site'
import type { Category, Product, ProductOption } from '#/lib/shop/types'

/**
 * Shared two-column detail layout for both `/shop/$slug` and `/shop/parent/$parentSlug`.
 * Everything to the right of the gallery follows the *selected* product, so the variant
 * group page only has to hand over its chosen member plus a picker to render.
 */
export function ProductDetailView({
  title,
  product,
  images,
  description,
  options,
  subscribable,
  displayName,
  categories,
  variantPicker,
  belowDescription,
}: {
  title: string
  /** The product that will be added to the cart. */
  product: Product
  images: string[]
  description: string | null
  options: ProductOption[]
  subscribable: boolean
  displayName?: string
  categories: Category[]
  variantPicker?: ReactNode
  belowDescription?: ReactNode
}) {
  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-20">
      <div className="wrap">
        <Breadcrumb title={title} category={categories[0]} />

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-8">
            <GalleryViewer
              images={images}
              alt={displayName ?? title}
              badge={
                product.onSale && product.basePriceCents ? (
                  <span className="bg-red px-2.5 py-1 text-[0.65rem] tracking-eyebrow text-cream uppercase">
                    On sale
                  </span>
                ) : null
              }
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[clamp(2rem,4vw,2.9rem)] text-balance">
                {title}
              </h1>
              <FavouriteButton
                productId={product.id}
                className="mt-1 shrink-0"
              />
            </div>

            {product.tags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li
                    key={tag.name}
                    className="inline-flex items-center gap-1.5 border border-gold-soft px-2.5 py-1 text-[0.65rem] tracking-eyebrow text-ink-soft uppercase"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: tag.color || 'var(--color-gold)' }}
                    />
                    {tag.name}
                  </li>
                ))}
              </ul>
            ) : null}

            <Ornament className="!mx-0 !justify-start" />

            <p className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-[2.2rem] leading-none text-green">
                {formatCents(product.priceCents)}
              </span>
              {product.onSale && product.basePriceCents ? (
                <span className="text-[1.1rem] text-ink-soft line-through">
                  {formatCents(product.basePriceCents)}
                </span>
              ) : null}
              {product.chargeGst ? (
                <span className="text-[0.8rem] text-ink-soft">inc. GST</span>
              ) : null}
            </p>

            <p className="mt-2 text-[0.8rem] tracking-nav uppercase">
              {product.inStock ? (
                <span className="text-green">In stock</span>
              ) : (
                <span className="text-red">Sold out</span>
              )}
            </p>

            {variantPicker}

            <ProductDescription html={description} className="mt-6" />

            {belowDescription}

            {product.minDeliveryDays ? (
              <p className="mt-6 border border-gold-soft bg-ivory px-4 py-3 text-[0.95rem] text-ink-soft">
                <span className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
                  Notice needed
                </span>
                <span className="mt-1 block">
                  Needs at least {product.minDeliveryDays}{' '}
                  {product.minDeliveryDays === 1 ? 'day' : 'days'}&rsquo; notice
                  — choose a pickup day at checkout.
                </span>
              </p>
            ) : null}

            <ProductPurchasePanel
              product={product}
              options={options}
              subscribable={subscribable}
              displayName={displayName}
            />

            <p className="mt-5 text-[0.9rem] text-ink-soft">
              Pickup only. Collect from {site.address.street},{' '}
              {site.address.suburb} — you choose your pickup day at checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Breadcrumb({
  title,
  category,
}: {
  title: string
  category: Category | undefined
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-[0.75rem] tracking-nav uppercase"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">
        <li>
          <Link to="/shop" className="hover:text-green">
            Shop
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to="/shop"
                search={{ category: categorySlug(category.name) }}
                className="hover:text-green"
              >
                {category.name}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true">/</li>
        <li className="text-green normal-case">{title}</li>
      </ol>
    </nav>
  )
}
