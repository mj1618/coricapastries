import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FavouriteButton } from '#/components/shop/FavouriteButton'
import { ShopImage } from '#/components/shop/ShopImage'
import { useCart } from '#/lib/shop/cart'
import { itemHref, itemImage, itemInStock, itemName } from '#/lib/shop/catalog'
import {
  itemChooseLabel,
  itemPricing,
  itemTags,
  quickAddProduct,
} from '#/lib/shop/browse'
import { formatCents } from '#/lib/shop/money'
import type { GridItem } from '#/lib/shop/catalog'
import type { Store, Tag } from '#/lib/shop/types'

/**
 * One tile in the shop grid (and in the "you may also like" rows). A variant group
 * renders once and links to its parent page; a standalone product links to its own.
 * The whole card is clickable via a stretched link, so the controls that sit on top
 * of it — the heart and the quick Add — are lifted with `relative z-10`.
 */
export function ShopCard({
  item,
  store,
  compact = false,
}: {
  item: GridItem
  store: Store
  compact?: boolean
}) {
  const href = itemHref(item)
  const name = itemName(item)
  const inStock = itemInStock(item)
  const price = itemPricing(item)
  const tags = itemTags(item)
  // The supplier logo is the Corica logo itself; cropped edge-to-edge in a square box
  // it reads as a mistake, so a photoless item gets the muted fallback tile instead.
  const image = itemImage(item, null)
  const quickAdd = quickAddProduct(store, item)
  const productId = item.kind === 'product' ? item.product.id : item.lead.id

  return (
    <article
      className={`group relative flex h-full flex-col border border-gold-soft bg-ivory transition-colors hover:border-gold ${
        inStock ? '' : 'opacity-80'
      }`}
    >
      <div className="relative border-b border-gold-soft">
        <ShopImage
          src={image}
          alt={name}
          className={inStock ? '' : 'opacity-60 grayscale-[35%]'}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
        />
        {price.basePriceCents ? (
          <span className="absolute top-2 left-2 z-10 bg-red px-2 py-1 text-[0.62rem] tracking-eyebrow text-cream uppercase">
            On sale
          </span>
        ) : null}
        {inStock ? null : (
          <span className="absolute top-2 left-2 z-10 bg-ink/80 px-2 py-1 text-[0.62rem] tracking-eyebrow text-cream uppercase">
            Sold out
          </span>
        )}
        <FavouriteButton
          productId={productId}
          size={17}
          className="absolute top-2 right-2 z-10"
        />
      </div>

      <div
        className={`flex flex-1 flex-col px-4 text-center ${compact ? 'pt-3 pb-4' : 'pt-4 pb-5'}`}
      >
        <h3
          className={`text-balance ${compact ? 'text-[1.2rem]' : 'text-[1.3rem]'}`}
        >
          {href ? (
            <Link
              to={href.to}
              params={href.params as never}
              className="after:absolute after:inset-0 hover:text-red"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>

        {tags.length > 0 ? <TagRow tags={tags} /> : null}

        <p className="mt-2 font-display text-[1.35rem] leading-none text-green">
          {price.from ? (
            <span className="mr-1 font-body text-[0.72rem] tracking-eyebrow text-ink-soft uppercase">
              From
            </span>
          ) : null}
          {formatCents(price.priceCents)}
          {price.basePriceCents ? (
            <span className="ml-2 font-body text-[0.95rem] text-ink-soft line-through">
              {formatCents(price.basePriceCents)}
            </span>
          ) : null}
        </p>

        <div className="mt-auto pt-4">
          {!inStock ? (
            <span className="text-[0.72rem] tracking-nav text-ink-soft uppercase">
              Sold out
            </span>
          ) : quickAdd ? (
            <QuickAdd productId={quickAdd.id} name={quickAdd.name} />
          ) : (
            <span className="inline-block border-b border-gold pb-0.5 text-[0.7rem] tracking-nav text-green uppercase transition-colors group-hover:text-red">
              {itemChooseLabel(store, item)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function TagRow({ tags }: { tags: Tag[] }) {
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-1.5">
      {tags.slice(0, 2).map((tag) => (
        <li
          key={tag.name}
          className="inline-flex items-center gap-1.5 border border-gold-soft px-2 py-0.5 text-[0.62rem] tracking-eyebrow text-ink-soft uppercase"
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
  )
}

/** Adds a no-choices product to the cart without leaving the grid. */
function QuickAdd({ productId, name }: { productId: string; name: string }) {
  const { add, hydrated } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      disabled={!hydrated}
      onClick={() => {
        add({ productId, quantity: 1 })
        setAdded(true)
        window.setTimeout(() => setAdded(false), 2200)
      }}
      className="relative z-10 border border-green px-4 py-2 text-[0.7rem] tracking-nav text-green uppercase transition-colors hover:bg-green hover:text-cream disabled:opacity-50"
    >
      {added ? 'Added ✓' : 'Add'}
      <span className="sr-only"> {name} to cart</span>
    </button>
  )
}
