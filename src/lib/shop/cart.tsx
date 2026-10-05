import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { analyticsItem, trackEcommerce } from '#/lib/analytics'
import { STORAGE_KEYS } from './config'
import type {
  CartLine,
  OptionSelected,
  Product,
  SubscriptionFrequency,
} from './types'

type CartState = { lines: CartLine[]; promoCode: string | null }

/** What the "Added to your cart" notification shows about the item just added. */
export type AddedItem = {
  name: string
  image?: string | null
  /** Option and subscription lines, e.g. "Size: Medium". */
  details?: string[]
  /** Unit price including option fees; when given, the add is reported to analytics. */
  unitCents?: number
}

export type LastAdded = AddedItem & { quantity: number; id: number }

type CartApi = CartState & {
  /** True once localStorage has been read (avoids SSR/hydration mismatch). */
  hydrated: boolean
  count: number
  /** Passing `item` opens the header's "Added to your cart" notification. */
  add: (
    line: {
      productId: string
      quantity?: number
      optionsSelected?: OptionSelected[]
      subscriptionFrequency?: SubscriptionFrequency
    },
    item?: AddedItem,
  ) => void
  lastAdded: LastAdded | null
  dismissAdded: () => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  setPromoCode: (code: string | null) => void
}

const CartContext = createContext<CartApi | null>(null)
const EMPTY: CartState = { lines: [], promoCode: null }

export function lineKey(
  productId: string,
  optionsSelected: OptionSelected[] = [],
  subscriptionFrequency?: SubscriptionFrequency,
) {
  const opts = [...optionsSelected]
    .sort((a, b) => a.productOptionId.localeCompare(b.productOptionId))
    .map((o) => `${o.productOptionId}=${o.value}`)
    .join('&')
  return `${productId}|${opts}|${subscriptionFrequency ?? ''}`
}

function read(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cart)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.lines)) return EMPTY
    return { lines: parsed.lines, promoCode: parsed.promoCode ?? null }
  } catch {
    return EMPTY
  }
}

function write(state: CartState) {
  try {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode); the cart lives in memory for this page.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [lastAdded, setLastAdded] = useState<LastAdded | null>(null)

  useEffect(() => {
    setState(read())
    setHydrated(true)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.cart) setState(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((fn: (s: CartState) => CartState) => {
    setState((prev) => {
      const next = fn(prev)
      write(next)
      return next
    })
  }, [])

  const add = useCallback<CartApi['add']>(
    (
      { productId, quantity = 1, optionsSelected = [], subscriptionFrequency },
      item,
    ) => {
      if (item) setLastAdded({ ...item, quantity, id: Date.now() })
      if (item?.unitCents != null) {
        trackEcommerce('add_to_cart', [
          analyticsItem({ id: productId, name: item.name }, item.unitCents, {
            quantity,
          }),
        ])
      }
      const key = lineKey(productId, optionsSelected, subscriptionFrequency)
      update((s) => {
        const existing = s.lines.find((l) => l.key === key)
        const lines = existing
          ? s.lines.map((l) =>
              l.key === key ? { ...l, quantity: l.quantity + quantity } : l,
            )
          : [
              ...s.lines,
              {
                key,
                productId,
                quantity,
                optionsSelected,
                subscriptionFrequency,
              },
            ]
        return { ...s, lines }
      })
    },
    [update],
  )

  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      update((s) => ({
        ...s,
        lines:
          quantity <= 0
            ? s.lines.filter((l) => l.key !== key)
            : s.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.floor(quantity) } : l,
              ),
      })),
    [update],
  )

  const remove = useCallback(
    (key: string) =>
      update((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) })),
    [update],
  )
  const clear = useCallback(() => update(() => EMPTY), [update])
  const dismissAdded = useCallback(() => setLastAdded(null), [])
  const setPromoCode = useCallback(
    (promoCode: string | null) => update((s) => ({ ...s, promoCode })),
    [update],
  )

  const value = useMemo<CartApi>(
    () => ({
      ...state,
      hydrated,
      count: state.lines.reduce((n, l) => n + l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      setPromoCode,
      lastAdded,
      dismissAdded,
    }),
    [
      state,
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      setPromoCode,
      lastAdded,
      dismissAdded,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

/** Line price = (unit price + option fees) × quantity, in cents. */
export function linePriceCents(line: CartLine, product: Product) {
  const fees = line.optionsSelected.reduce(
    (n, o) => n + (o.feeAmountCents ?? 0),
    0,
  )
  return (product.priceCents + fees) * line.quantity
}
