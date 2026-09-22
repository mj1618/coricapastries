// Pure helpers for the shop browse pages (grid, category chips, search, sort).
// Everything here is derived from the /store snapshot — no fetching, no React.

import {
  categorySlug,
  gridItems,
  itemCategoryIds,
  itemInStock,
  itemMinPrice,
  itemName,
  itemSortIndex,
  optionsFor,
  sortedCategories,
} from './catalog'
import type { GridItem } from './catalog'
import type { seo } from '#/lib/seo'
import type { Filter, Product, Store, Tag, VariantGroup } from './types'

/* ----------------------------------------------------------------- search */

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'name', label: 'Name: A to Z' },
]

const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.key))

export type ShopSearch = {
  category?: string
  q?: string
  sort?: SortKey
  /** Selected facet values as `filterId:valueId` pairs joined by `~`. */
  f?: string
}

/** Reads `?category=&q=&sort=&f=` off the URL, dropping anything unrecognised. */
export function validateShopSearch(
  search: Record<string, unknown>,
): ShopSearch {
  const out: ShopSearch = {}
  const category = typeof search.category === 'string' ? search.category : ''
  if (category) out.category = category
  const q = typeof search.q === 'string' ? search.q.slice(0, 80) : ''
  if (q.trim()) out.q = q
  const sort = typeof search.sort === 'string' ? search.sort : ''
  if (SORT_KEYS.has(sort) && sort !== 'featured') out.sort = sort as SortKey
  const f = typeof search.f === 'string' ? search.f.slice(0, 200) : ''
  if (f) out.f = f
  return out
}

export function parseFilterSelection(f: string | undefined) {
  const out: Record<string, string> = {}
  for (const pair of (f ?? '').split('~')) {
    const [filterId, valueId] = pair.split(':')
    if (filterId && valueId) out[filterId] = valueId
  }
  return out
}

export function serialiseFilterSelection(selected: Record<string, string>) {
  const f = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join('~')
  return f || undefined
}

/* ------------------------------------------------------------- categories */

export type CategoryChip = {
  /** `null` for the "All" chip. */
  slug: string | null
  name: string
  count: number
}

/**
 * "All" plus every category in the supplier's order, each with the number of grid
 * items in it. "Extras" (bags and plaques) shares sortIndex 0 with Small Pastries,
 * so it is pushed to the end where it reads as an add-on rather than a range.
 */
export function categoryChips(store: Store, items: GridItem[]): CategoryChip[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const id of itemCategoryIds(item)) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  const categories = sortedCategories(store)
  const extras = categories.filter((c) => c.name.toLowerCase() === 'extras')
  const ordered = [
    ...categories.filter((c) => c.name.toLowerCase() !== 'extras'),
    ...extras,
  ]
  return [
    { slug: null, name: 'All', count: items.length },
    ...ordered.map((c) => ({
      slug: categorySlug(c.name),
      name: c.name,
      count: counts.get(c.id) ?? 0,
    })),
  ]
}

/* ------------------------------------------------------ filtering/sorting */

/** Text a shopper might type to find an item: its name, plus member names for a group. */
function searchHaystack(item: GridItem) {
  if (item.kind === 'product') return item.product.name.toLowerCase()
  return [
    item.group.name,
    ...item.group.products.map((m) => m.displayName),
    ...item.members.map((m) => m.name),
  ]
    .join(' ')
    .toLowerCase()
}

/**
 * Faceted filters, generically. This supplier currently publishes none, so in practice
 * `store.filters` is empty and this returns `[]` — but the rules are the ones in the
 * SupplyWise spec: scope filters to a chosen category, count each value against the
 * other active selections, and hide zero-count values unless already selected.
 */
export function availableFilters(
  store: Store,
  pool: GridItem[],
  selected: Record<string, string>,
): {
  filter: Filter
  values: { id: string; name: string; count: number; selected: boolean }[]
}[] {
  if (store.filters.length === 0) return []
  const productsOf = (item: GridItem): Product[] =>
    item.kind === 'group' ? item.members : [item.product]
  const matches = (item: GridItem, skipFilterId: string) =>
    Object.entries(selected).every(
      ([filterId, valueId]) =>
        filterId === skipFilterId ||
        productsOf(item).some((p) => p.filterValueIds.includes(valueId)),
    )

  return [...store.filters]
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((filter) => {
      const candidates = pool.filter((item) => matches(item, filter.id))
      const values = [...filter.values]
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .map((value) => ({
          id: value.id,
          name: value.name,
          count: candidates.filter((item) =>
            productsOf(item).some((p) => p.filterValueIds.includes(value.id)),
          ).length,
          selected: selected[filter.id] === value.id,
        }))
        .filter((v) => v.count > 0 || v.selected)
      return { filter, values }
    })
    .filter((f) => f.values.length > 0)
}

export function itemsInCategory(
  store: Store,
  items: GridItem[],
  slug: string | undefined,
): GridItem[] {
  if (!slug) return items
  const category = store.categories.find((c) => categorySlug(c.name) === slug)
  if (!category) return items
  return items.filter((item) => itemCategoryIds(item).includes(category.id))
}

function hasPhoto(item: GridItem) {
  return item.kind === 'group'
    ? item.members.some((m) => m.images.length > 0) ||
        item.group.images.length > 0
    : item.product.images.length > 0
}

export function sortItems(
  items: GridItem[],
  sort: SortKey,
  extrasCategoryId?: string | null,
): GridItem[] {
  const byName = (a: GridItem, b: GridItem) =>
    itemName(a).localeCompare(itemName(b), 'en-AU')
  // Bags and plaques ("Extras") share sortIndex 0 with the pastries; in the
  // featured order they belong after the food, not in the first row.
  const isExtraOnly = (item: GridItem) => {
    if (!extrasCategoryId) return 0
    const ids = itemCategoryIds(item)
    return ids.length > 0 && ids.every((id) => id === extrasCategoryId) ? 1 : 0
  }
  const copy = [...items]
  switch (sort) {
    case 'price-asc':
      return copy.sort(
        (a, b) => itemMinPrice(a) - itemMinPrice(b) || byName(a, b),
      )
    case 'price-desc':
      return copy.sort(
        (a, b) => itemMinPrice(b) - itemMinPrice(a) || byName(a, b),
      )
    case 'name':
      return copy.sort(byName)
    default:
      // Featured = the supplier's own order. Seventeen items share sortIndex 0
      // (the ones they have never sorted), so photographed items win that tie —
      // it only ever reorders items the supplier left level with each other.
      return copy.sort(
        (a, b) =>
          isExtraOnly(a) - isExtraOnly(b) ||
          itemSortIndex(a) - itemSortIndex(b) ||
          Number(hasPhoto(b)) - Number(hasPhoto(a)) ||
          byName(a, b),
      )
  }
}

/** Grid contents for the current URL: category, then facets, then search, then sort. */
export function browseItems(store: Store, search: ShopSearch): GridItem[] {
  const all = gridItems(store)
  let items = itemsInCategory(store, all, search.category)
  const selected = Object.values(parseFilterSelection(search.f))
  if (selected.length > 0) {
    items = items.filter((item) => {
      const products = item.kind === 'group' ? item.members : [item.product]
      return selected.every((valueId) =>
        products.some((p) => p.filterValueIds.includes(valueId)),
      )
    })
  }
  const q = (search.q ?? '').trim().toLowerCase()
  if (q) items = items.filter((item) => searchHaystack(item).includes(q))
  const extras = store.categories.find((c) => c.name.toLowerCase() === 'extras')
  return sortItems(items, search.sort ?? 'featured', extras?.id)
}

/* ------------------------------------------------------------- card facts */

export type ItemPricing = {
  /** True when a variant group spans several prices, so the card reads "From $x". */
  from: boolean
  priceCents: number
  /** Pre-discount price to strike through, when the item is on sale. */
  basePriceCents: number | null
}

export function itemPricing(item: GridItem): ItemPricing {
  if (item.kind === 'product') {
    const p = item.product
    return {
      from: false,
      priceCents: p.priceCents,
      basePriceCents: p.onSale ? p.basePriceCents : null,
    }
  }
  const cheapest = item.members.reduce((a, b) =>
    b.priceCents < a.priceCents ? b : a,
  )
  return {
    from: item.minPriceCents !== item.maxPriceCents,
    priceCents: item.minPriceCents,
    basePriceCents: cheapest.onSale ? cheapest.basePriceCents : null,
  }
}

/** Tags to show on a card: a group shows the union of its members' tags. */
export function itemTags(item: GridItem): Tag[] {
  const tags =
    item.kind === 'product'
      ? item.product.tags
      : item.members.flatMap((m) => m.tags)
  const seen = new Set<string>()
  return tags.filter((t) => {
    const key = t.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * A card can add straight to the cart only when there is exactly one thing to add and
 * nothing to choose: a standalone, in-stock product with no options. Everything else
 * sends the shopper to the detail page.
 */
export function quickAddProduct(store: Store, item: GridItem): Product | null {
  if (item.kind !== 'product') return null
  const p = item.product
  if (!p.inStock) return null
  if (optionsFor(store, p.id).length > 0) return null
  return p
}

/**
 * Wording for a variant group whose members are a choice the supplier has not described
 * in SupplyWise (they all have an empty `selectionLabel`). Keyed on the group name.
 * Some groups are a flavour choice rather than a size: the Torta Slice group is
 * Moka, Rum, Black Forrest, Hazelnut and Ganache slices.
 */
const GROUP_CHOICE_LABELS: Record<string, string> = {
  'torta slice': 'Choose a flavour',
}

/** The noun for what the shopper is choosing within a group: its own label, else "size". */
export function groupChoiceLabel(group: VariantGroup): string {
  const own = group.selectionLabel?.trim()
  if (own) return own
  return GROUP_CHOICE_LABELS[group.name.trim().toLowerCase()] ?? 'Choose a size'
}

/** Call-to-action wording for an item that cannot be added straight from the card. */
export function itemChooseLabel(store: Store, item: GridItem): string {
  if (item.kind === 'group') {
    return groupChoiceLabel(item.group)
  }
  const options = optionsFor(store, item.product.id)
  const first = options[0]
  if (options.length === 1 && first.type === 'select') {
    const label = first.selectionLabel?.trim() || first.name
    return label
  }
  return 'Choose options'
}

/* --------------------------------------------------------------- variants */

/** Default variant on a parent page: first in-stock member, else the first. */
export function defaultVariantId<T extends { id: string; inStock: boolean }>(
  members: T[],
): string | null {
  if (members.length === 0) return null
  return (members.find((m) => m.inStock) ?? members[0]).id
}

/**
 * `seo()` builds og:image from a path on our own site. Product photography lives on
 * SupplyWise, so swap in the absolute URL when the item has one.
 */
export function withRemoteOgImage(
  head: ReturnType<typeof seo>,
  image: string | null | undefined,
) {
  if (!image) return head
  return {
    ...head,
    meta: head.meta.map((m) =>
      'property' in m && m.property === 'og:image'
        ? { property: 'og:image', content: image }
        : m,
    ),
  }
}

/** Trims text to a sentence-ish length for meta descriptions. */
export function truncate(text: string, max = 150) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const stop = cut.lastIndexOf(' ')
  return `${(stop > max * 0.6 ? cut.slice(0, stop) : cut).replace(/[,;:.\s]+$/, '')}…`
}

export { itemInStock }
