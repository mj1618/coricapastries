import { Reveal } from '#/components/Reveal'
import { ShopCard } from '#/components/shop/ShopCard'
import { Eyebrow, Ornament } from '#/components/ui'
import type { GridItem } from '#/lib/shop/catalog'
import type { Store } from '#/lib/shop/types'

/**
 * "You may also like" — SupplyWise's co-purchase suggestions, padded out with the
 * newest in-stock items by `recommendations()` so the row is always full.
 */
export function RecommendRow({
  items,
  store,
  title = 'You may also like',
}: {
  items: GridItem[]
  store: Store
  title?: string
}) {
  if (items.length === 0) return null
  return (
    <section className="border-t border-gold-soft bg-cream-deep/40 py-14 md:py-16">
      <div className="wrap">
        <Reveal className="text-center">
          <Eyebrow green>More from the shop</Eyebrow>
          <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{title}</h2>
          <Ornament />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.key} delay={(i % 4) * 0.06} className="h-full">
              <ShopCard item={item} store={store} compact />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
