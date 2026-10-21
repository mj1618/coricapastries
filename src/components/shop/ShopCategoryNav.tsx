import { Link } from '@tanstack/react-router'
import type { CategoryChip } from '#/lib/shop/browse'

const TAB =
  'block border-b-2 py-1.5 text-[0.78rem] tracking-nav uppercase transition-colors'
const TAB_ON = 'border-gold text-green'
const TAB_OFF =
  'border-transparent text-ink-soft hover:border-gold-soft hover:text-green'
const COUNT = 'ml-1.5 text-[0.7rem] tracking-normal text-ink-soft/70'

/**
 * Category tabs under the shop hero. Mirrors the patisserie's range nav: a hairline
 * bar that wraps on desktop and scrolls sideways on a phone. Choosing a category keeps
 * the search term and sort but clears any facet selection, which only makes sense
 * inside the category it was chosen in.
 *
 * `favourites` adds a "Favourites" tab after "All" (guide §8 A12). It is a category
 * in all but name: choosing it replaces the category and clears the facets, and
 * choosing a category leaves it. Pass `null` to hide it (no favourites, or not read
 * from storage yet).
 */
export function ShopCategoryNav({
  chips,
  current,
  favourites,
}: {
  chips: CategoryChip[]
  current: string | undefined
  favourites: { count: number; active: boolean } | null
}) {
  // `categoryChips()` always puts "All" first.
  const [all, ...categories] = chips
  return (
    <nav
      aria-label="Shop categories"
      className="border-y border-gold-soft bg-ivory"
    >
      <div className="wrap">
        <ul className="-mx-4 flex gap-x-6 gap-y-1 overflow-x-auto px-4 py-4 whitespace-nowrap md:mx-0 md:flex-wrap md:justify-center md:gap-x-7 md:overflow-visible md:px-0">
          <CategoryTab
            chip={all}
            active={!favourites?.active && current === undefined}
          />
          {favourites ? (
            <li className="shrink-0">
              <Link
                to="/shop"
                search={(prev) => ({
                  q: prev.q,
                  sort: prev.sort,
                  favourites: 1,
                })}
                aria-current={favourites.active ? 'page' : undefined}
                className={`${TAB} inline-flex items-center ${
                  favourites.active ? TAB_ON : TAB_OFF
                }`}
              >
                <svg
                  width={11}
                  height={11}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="mr-1.5 text-red"
                >
                  <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2 0 3.4 1.1 4.4 2.5C12 6.1 13.4 5 15.4 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z" />
                </svg>
                Favourites
                <span className={COUNT}>{favourites.count}</span>
              </Link>
            </li>
          ) : null}
          {categories.map((chip) => (
            <CategoryTab
              key={chip.slug ?? 'all'}
              chip={chip}
              active={
                !favourites?.active && (chip.slug ?? undefined) === current
              }
            />
          ))}
        </ul>
      </div>
    </nav>
  )
}

function CategoryTab({
  chip,
  active,
}: {
  chip: CategoryChip
  active: boolean
}) {
  return (
    <li className="shrink-0">
      <Link
        to="/shop"
        search={(prev) => ({
          ...prev,
          category: chip.slug ?? undefined,
          f: undefined,
          favourites: undefined,
        })}
        aria-current={active ? 'page' : undefined}
        className={`${TAB} ${active ? TAB_ON : TAB_OFF} ${
          chip.count === 0 ? 'opacity-45' : ''
        }`}
      >
        {chip.name}
        <span className={COUNT}>{chip.count}</span>
      </Link>
    </li>
  )
}
