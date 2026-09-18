import { Link } from '@tanstack/react-router'
import type { CategoryChip } from '#/lib/shop/browse'

/**
 * Category tabs under the shop hero. Mirrors the patisserie's range nav: a hairline
 * bar that wraps on desktop and scrolls sideways on a phone. Choosing a category keeps
 * the search term and sort but clears any facet selection, which only makes sense
 * inside the category it was chosen in.
 */
export function ShopCategoryNav({
  chips,
  current,
}: {
  chips: CategoryChip[]
  current: string | undefined
}) {
  return (
    <nav
      aria-label="Shop categories"
      className="border-y border-gold-soft bg-ivory"
    >
      <div className="wrap">
        <ul className="-mx-4 flex gap-x-6 gap-y-1 overflow-x-auto px-4 py-4 whitespace-nowrap md:mx-0 md:flex-wrap md:justify-center md:gap-x-7 md:overflow-visible md:px-0">
          {chips.map((chip) => {
            const active = (chip.slug ?? undefined) === current
            return (
              <li key={chip.slug ?? 'all'} className="shrink-0">
                <Link
                  to="/shop"
                  search={(prev) => ({
                    ...prev,
                    category: chip.slug ?? undefined,
                    f: undefined,
                  })}
                  aria-current={active ? 'page' : undefined}
                  className={`block border-b-2 py-1.5 text-[0.78rem] tracking-nav uppercase transition-colors ${
                    active
                      ? 'border-gold text-green'
                      : 'border-transparent text-ink-soft hover:border-gold-soft hover:text-green'
                  } ${chip.count === 0 ? 'opacity-45' : ''}`}
                >
                  {chip.name}
                  <span className="ml-1.5 text-[0.7rem] tracking-normal text-ink-soft/70">
                    {chip.count}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
