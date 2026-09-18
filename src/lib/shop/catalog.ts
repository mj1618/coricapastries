import type {
  Category,
  Product,
  ProductOption,
  Store,
  VariantGroup,
} from './types'

/** Products by id. */
export function productMap(store: Store) {
  return new Map(store.products.map((p) => [p.id, p]))
}

/** Product id → the variant group it belongs to (if any). */
export function parentByProductId(store: Store) {
  const m = new Map<string, VariantGroup>()
  for (const g of store.parents)
    for (const member of g.products) m.set(member.productId, g)
  return m
}

/** Categories in display order. */
export function sortedCategories(store: Store): Category[] {
  return [...store.categories].sort(
    (a, b) => a.sortIndex - b.sortIndex || a.name.localeCompare(b.name),
  )
}

/** Options that apply to a product. */
export function optionsFor(
  store: Pick<Store, 'options'>,
  productId: string,
): ProductOption[] {
  return store.options.filter((o) => o.productIds.includes(productId))
}

/**
 * One entry per buyable thing for the grid: a variant group renders once (using its
 * members for price range / stock / category), a standalone product renders itself.
 */
export type GridItem =
  | { kind: 'product'; key: string; product: Product }
  | {
      kind: 'group'
      key: string
      group: VariantGroup
      members: Product[]
      /** First in-stock member, else first member. Used for the card image/price. */
      lead: Product
      minPriceCents: number
      maxPriceCents: number
      categoryIds: string[]
      inStock: boolean
      sortIndex: number
      createdAt: number
    }

export function gridItems(store: Store): GridItem[] {
  const byId = productMap(store)
  const grouped = new Set<string>()
  const items: GridItem[] = []
  for (const group of store.parents) {
    const members = group.products
      .map((m) => byId.get(m.productId))
      .filter((p): p is Product => !!p)
    if (members.length === 0) continue
    for (const m of members) grouped.add(m.id)
    const lead = members.find((m) => m.inStock) ?? members[0]
    const prices = members.map((m) => m.priceCents)
    items.push({
      kind: 'group',
      key: `group:${group.id}`,
      group,
      members,
      lead,
      minPriceCents: Math.min(...prices),
      maxPriceCents: Math.max(...prices),
      categoryIds: [...new Set(members.flatMap((m) => m.categoryIds))],
      inStock: members.some((m) => m.inStock),
      sortIndex: Math.min(...members.map((m) => m.sortIndex)),
      createdAt: Math.max(...members.map((m) => m.createdAt)),
    })
  }
  for (const p of store.products) {
    if (grouped.has(p.id)) continue
    items.push({ kind: 'product', key: `product:${p.id}`, product: p })
  }
  return items
}

export function itemName(item: GridItem) {
  return item.kind === 'group' ? item.group.name : item.product.name
}
export function itemCategoryIds(item: GridItem) {
  return item.kind === 'group' ? item.categoryIds : item.product.categoryIds
}
export function itemSortIndex(item: GridItem) {
  return item.kind === 'group' ? item.sortIndex : item.product.sortIndex
}
export function itemMinPrice(item: GridItem) {
  return item.kind === 'group' ? item.minPriceCents : item.product.priceCents
}
export function itemInStock(item: GridItem) {
  return item.kind === 'group' ? item.inStock : item.product.inStock
}
export function itemImage(item: GridItem, supplierLogo: string | null) {
  if (item.kind === 'group') {
    return item.lead.image ?? item.group.image ?? supplierLogo
  }
  return item.product.image ?? supplierLogo
}
/** Internal link for an item. */
export function itemHref(
  item: GridItem,
): {
  to: '/shop/$slug' | '/shop/parent/$parentSlug'
  params: Record<string, string>
} | null {
  if (item.kind === 'group') {
    return item.group.slug
      ? {
          to: '/shop/parent/$parentSlug',
          params: { parentSlug: item.group.slug },
        }
      : null
  }
  return item.product.slug
    ? { to: '/shop/$slug', params: { slug: item.product.slug } }
    : null
}

/**
 * "You may also like": resolve recommended ids, collapse variants to their group,
 * and pad with newest in-stock items to a fixed row length.
 */
export function recommendations(
  store: Store,
  recommendedIds: string[],
  excludeProductIds: string[],
  length = 4,
): GridItem[] {
  const items = gridItems(store)
  const parentOf = parentByProductId(store)
  const byProduct = new Map<string, GridItem>()
  for (const it of items) {
    if (it.kind === 'group') for (const m of it.members) byProduct.set(m.id, it)
    else byProduct.set(it.product.id, it)
  }
  const excludedKeys = new Set(
    excludeProductIds
      .map((id) => byProduct.get(id)?.key)
      .filter(Boolean) as string[],
  )
  const out: GridItem[] = []
  const seen = new Set<string>()
  const push = (it: GridItem | undefined) => {
    if (!it || seen.has(it.key) || excludedKeys.has(it.key)) return
    seen.add(it.key)
    out.push(it)
  }
  for (const id of recommendedIds) push(byProduct.get(id))
  if (out.length < length) {
    const newest = [...items].filter(itemInStock).sort((a, b) => {
      const ca = a.kind === 'group' ? a.createdAt : a.product.createdAt
      const cb = b.kind === 'group' ? b.createdAt : b.product.createdAt
      return cb - ca
    })
    for (const it of newest) {
      if (out.length >= length) break
      push(it)
    }
  }
  void parentOf
  return out.slice(0, length)
}

/** URL-friendly category key used in `/shop?category=…`, derived from the name. */
export function categorySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function findCategoryBySlug(
  store: Pick<Store, 'categories'>,
  slug: string,
) {
  return store.categories.find((c) => categorySlug(c.name) === slug) ?? null
}
