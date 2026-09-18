import {
  Link,
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useId, useState } from 'react'
import { Reveal } from '#/components/Reveal'
import { ShopCard } from '#/components/shop/ShopCard'
import { ShopCategoryNav } from '#/components/shop/ShopCategoryNav'
import { PageHero } from '#/components/ui'
import { site } from '#/data/site'
import {
  SORT_OPTIONS,
  availableFilters,
  browseItems,
  categoryChips,
  itemsInCategory,
  parseFilterSelection,
  serialiseFilterSelection,
  validateShopSearch,
} from '#/lib/shop/browse'
import { findCategoryBySlug, gridItems } from '#/lib/shop/catalog'
import { seo } from '#/lib/seo'
import type { SortKey } from '#/lib/shop/browse'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/')({
  validateSearch: validateShopSearch,
  head: () =>
    seo({
      title: 'Shop',
      description:
        'Order Corica Pastries online for pickup from 106 Aberdeen Street, Northbridge. Strudels, tortas, cheesecakes, small pastries and biscuits, with your pickup day chosen at checkout.',
      path: '/shop',
    }),
  component: Page,
})

function Page() {
  const { store } = shopRoute.useLoaderData()
  const search = Route.useSearch()

  const all = gridItems(store)
  const chips = categoryChips(store, all)
  const category = search.category
    ? findCategoryBySlug(store, search.category)
    : null
  const items = browseItems(store, search)
  const sort: SortKey = search.sort ?? 'featured'
  const gstInclusive = store.products.every((p) => p.chargeGst)

  // Facets are scoped to a chosen category. This supplier publishes none today, so
  // `filterGroups` is empty and nothing renders — the rules live in browse.ts.
  const filterGroups = category
    ? availableFilters(
        store,
        itemsInCategory(store, all, search.category),
        parseFilterSelection(search.f),
      )
    : []

  return (
    <>
      <PageHero
        eyebrow="Order online"
        title="Order for pickup from Aberdeen Street."
        lede={`Order online and collect from the shop at ${site.address.street}, ${site.address.suburb} — you choose your pickup day at checkout.`}
      />

      <ShopCategoryNav chips={chips} current={search.category} />

      <section className="pt-8 pb-16 md:pt-10 md:pb-20">
        <div className="wrap">
          <Toolbar
            count={items.length}
            categoryName={category?.name ?? null}
            q={search.q ?? ''}
            sort={sort}
          />

          {filterGroups.length > 0 ? (
            <FilterBar
              groups={filterGroups}
              selected={parseFilterSelection(search.f)}
            />
          ) : null}

          {items.length === 0 ? (
            <EmptyState q={search.q} categoryName={category?.name ?? null} />
          ) : (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, i) => (
                <Reveal
                  key={item.key}
                  delay={(i % 4) * 0.05}
                  className="h-full"
                >
                  <ShopCard item={item} store={store} />
                </Reveal>
              ))}
            </div>
          )}

          <p className="mt-12 border-t border-gold-soft pt-6 text-center text-[0.95rem] text-ink-soft">
            {gstInclusive ? 'Prices include GST. ' : ''}Online orders are for
            pickup only. Some items need a few days&rsquo; notice, which is
            shown on the item and again when you choose a pickup day at
            checkout.
          </p>
        </div>
      </section>
    </>
  )
}

/* --------------------------------------------------------------- toolbar */

function Toolbar({
  count,
  categoryName,
  q,
  sort,
}: {
  count: number
  categoryName: string | null
  q: string
  sort: SortKey
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <p className="text-[0.95rem] text-ink-soft">
        {count} {count === 1 ? 'item' : 'items'}
        {categoryName ? ` in ${categoryName}` : ' in the shop'}
        {q ? ` matching “${q}”` : ''}
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <SearchBox value={q} />
        <SortSelect value={sort} />
      </div>
    </div>
  )
}

/** Live name search. Keeps the URL shareable by writing `?q=` as the shopper types. */
function SearchBox({ value }: { value: string }) {
  const id = useId()
  const navigate = useNavigate({ from: '/shop' })
  const [text, setText] = useState(value)

  // Adopt the URL's value when it changes from elsewhere (back button, category link).
  const [seen, setSeen] = useState(value)
  if (seen !== value) {
    setSeen(value)
    setText(value)
  }

  useEffect(() => {
    if (text === value) return
    const timer = window.setTimeout(() => {
      void navigate({
        search: (prev) => ({ ...prev, q: text.trim() || undefined }),
        replace: true,
      })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [text, value, navigate])

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.7rem] tracking-eyebrow text-gold uppercase"
      >
        Search
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Strudel, torta, cannoli…"
          className="w-[min(18rem,70vw)] border border-gold-soft bg-ivory px-3 py-2 text-[1rem] text-ink placeholder:text-ink-soft/60 focus:border-gold focus:outline-none"
        />
      </div>
    </div>
  )
}

function SortSelect({ value }: { value: SortKey }) {
  const id = useId()
  const navigate = useNavigate({ from: '/shop' })
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.7rem] tracking-eyebrow text-gold uppercase"
      >
        Sort by
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) =>
          void navigate({
            search: (prev) => ({
              ...prev,
              sort:
                e.target.value === 'featured'
                  ? undefined
                  : (e.target.value as SortKey),
            }),
          })
        }
        className="mt-1.5 border border-gold-soft bg-ivory px-3 py-2 text-[1rem] text-ink focus:border-gold focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ---------------------------------------------------------------- facets */

function FilterBar({
  groups,
  selected,
}: {
  groups: ReturnType<typeof availableFilters>
  selected: Record<string, string>
}) {
  return (
    <div className="mt-6 space-y-4 border-t border-gold-soft pt-5">
      {groups.map(({ filter, values }) => (
        <fieldset key={filter.id}>
          <legend className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
            {filter.name}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {values.map((value) => (
              <Link
                key={value.id}
                to="/shop"
                search={(prev) => ({
                  ...prev,
                  f: serialiseFilterSelection({
                    ...selected,
                    [filter.id]: value.selected ? '' : value.id,
                  }),
                })}
                aria-pressed={value.selected}
                className={`border px-3 py-1.5 text-[0.9rem] transition-colors ${
                  value.selected
                    ? 'border-green bg-green text-cream'
                    : 'border-gold-soft bg-ivory text-ink hover:border-gold'
                }`}
              >
                {value.name}{' '}
                <span className="text-[0.8rem] opacity-70">{value.count}</span>
              </Link>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------- empty state */

function EmptyState({
  q,
  categoryName,
}: {
  q: string | undefined
  categoryName: string | null
}) {
  return (
    <div className="mt-10 border border-gold-soft bg-ivory px-6 py-14 text-center">
      <h2 className="text-[1.7rem]">Nothing to show here yet</h2>
      <p className="mx-auto mt-3 max-w-[46ch] text-ink-soft">
        {q
          ? `We could not find anything matching “${q}”${categoryName ? ` in ${categoryName}` : ''}.`
          : `There is nothing in ${categoryName ?? 'this part of the shop'} at the moment.`}{' '}
        Try another range, or call the shop on{' '}
        <a href={site.phone.href} className="link-gold">
          {site.phone.display}
        </a>
        .
      </p>
      <Link to="/shop" search={{}} className="btn mt-7 inline-block">
        Show everything
      </Link>
    </div>
  )
}
