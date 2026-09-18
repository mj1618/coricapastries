import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from './config'
import type {
  CartLine,
  OptionSelected,
  Product,
  SubscriptionFrequency,
} from './types'

type CartState = { lines: CartLine[]; promoCode: string | null }

type CartApi = CartState & {
  /** True once localStorage has been read (avoids SSR/hydration mismatch). */
  hydrated: boolean
  count: number
  add: (line: {
    productId: string
    quantity?: number
    optionsSelected?: OptionSelected[]
    subscriptionFrequency?: SubscriptionFrequency
  }) => void
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
    ({
      productId,
      quantity = 1,
      optionsSelected = [],
      subscriptionFrequency,
    }) => {
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
    }),
    [state, hydrated, add, setQuantity, remove, clear, setPromoCode],
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
