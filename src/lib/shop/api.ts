import { apiBase } from './config'
import type {
  CartLine,
  CheckoutResult,
  ParentDetail,
  Product,
  ProductDetail,
  PromoResult,
  Store,
} from './types'

/** An error response from SupplyWise: `{ error: { code, message } }`. */
export class ApiError extends Error {
  code: string
  status: number
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/** True when a fetch rejected before reaching the server (blocker, offline, DNS). */
export function isNetworkError(err: unknown) {
  return err instanceof TypeError
}

export const BLOCKER_HINT =
  'A browser extension, ad or privacy blocker, or a network filter may be blocking the request. Try disabling blockers or using a different browser or network.'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  })
  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  if (!res.ok) {
    const err = json?.error ?? {}
    throw new ApiError(
      res.status,
      err.code ?? `http_${res.status}`,
      err.message ?? `Request failed (${res.status})`,
    )
  }
  return json as T
}

// Server-side memo so a burst of SSR requests does not hammer SupplyWise.
let storeCache: { at: number; data: Store } | null = null
const STORE_TTL_MS = 60_000

/** Whole-store snapshot. Cached for a minute on the server. */
export async function getStore(): Promise<Store> {
  const onServer = typeof window === 'undefined'
  if (onServer && storeCache && Date.now() - storeCache.at < STORE_TTL_MS) {
    return storeCache.data
  }
  const data = await request<Store>('/store')
  if (onServer) storeCache = { at: Date.now(), data }
  return data
}

export function getProducts() {
  return request<{ products: Product[] }>('/products')
}

export function getProduct(slug: string) {
  return request<ProductDetail>(`/products/${encodeURIComponent(slug)}`)
}

export function getParent(slug: string) {
  return request<ParentDetail>(`/products/parent/${encodeURIComponent(slug)}`)
}

export function validatePromoCode(body: {
  promoCode: string
  items: {
    productId: string
    customerPriceCents: number
    quantity: number
    chargeGST: boolean
    categoryIds: string[]
  }[]
}) {
  return request<PromoResult>('/promo-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Hands the cart to SupplyWise. Redirect the shopper to `checkoutUrl`. */
export function createCheckout(body: {
  items: Omit<CartLine, 'key'>[]
  promoCode?: string
  pickupOrDelivery?: 'pickup' | 'delivery'
}) {
  return request<CheckoutResult>('/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Raw authenticated call helper for /account/* (token handling lives in auth.ts). */
export function authedRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  return request<T>(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
