import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { FavouriteButton } from '#/components/shop/FavouriteButton'
import { optionsFor, parentByProductId } from '#/lib/shop/catalog'
import { useCart } from '#/lib/shop/cart'
import { formatCents } from '#/lib/shop/money'
import type { Store } from '#/lib/shop/types'

/**
 * A saved / previously-ordered product on the account page.
 *
 * Only products that can be added in one click get an "Add to cart" button: anything
 * with product options, or that belongs to a variant group, links to its page instead
 * so the shopper makes the choice there.
 */
export function AccountProductTile({
  store,
  productId,
  meta,
  showHeart = true,
}: {
  store: Store
  productId: string
  meta?: ReactNode
  showHeart?: boolean
}) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const product = store.products.find((p) => p.id === productId)
  if (!product) {
    return (
      <li className="frame-card flex items-center px-6 py-8 text-center text-ink-soft italic">
        <p className="w-full">This item is no longer in the online shop.</p>
      </li>
    )
  }

  const group = parentByProductId(store).get(product.id)
  const hasOptions = optionsFor(store, product.id).length > 0
  const image = product.image ?? store.supplier.image

  const link =
    group && group.slug
      ? {
          to: '/shop/parent/$parentSlug' as const,
          params: { parentSlug: group.slug },
        }
      : hasOptions && product.slug
        ? { to: '/shop/$slug' as const, params: { slug: product.slug } }
        : null

  // Variant members are often named "Half Apple Strudel" inside a group called
  // "Apple Strudel", so prefer the group's own display name for the member.
  const displayName = group?.products.find(
    (m) => m.productId === product.id,
  )?.displayName
  const title = group
    ? `${group.name} — ${displayName ?? product.name}`
    : product.name

  return (
    <li className="frame-card relative flex flex-col p-4">
      {showHeart ? (
        <div className="absolute top-6 right-6 z-10">
          <FavouriteButton productId={product.id} size={16} />
        </div>
      ) : null}

      <div className="aspect-square overflow-hidden bg-cream-deep/40">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2 text-center">
        <h3 className="font-display text-[1.25rem] leading-snug text-green">
          {link ? (
            <Link
              to={link.to}
              params={link.params}
              className="transition-colors hover:text-red"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>

        <p className="mt-1 text-[1rem] text-ink-soft">
          {formatCents(product.priceCents)}
          {product.onSale && product.basePriceCents ? (
            <span className="ml-2 text-ink-soft/70 line-through">
              {formatCents(product.basePriceCents)}
            </span>
          ) : null}
        </p>

        {meta ? (
          <p className="mt-1 text-[0.95rem] text-ink-soft italic">{meta}</p>
        ) : null}

        <div className="mt-auto pt-4">
          {!product.inStock ? (
            <span className="inline-block border border-gold-soft px-4 py-2 text-[0.78rem] tracking-[0.22em] text-ink-soft uppercase">
              Out of stock
            </span>
          ) : link ? (
            <Link
              to={link.to}
              params={link.params}
              className="btn w-full sm:w-auto"
            >
              {group ? 'Choose a size' : 'Choose options'}
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-solid w-full sm:w-auto"
              onClick={() => {
                add({ productId: product.id })
                setAdded(true)
                window.setTimeout(() => setAdded(false), 2000)
              }}
            >
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

export function AccountProductGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </ul>
  )
}
