/** SupplyWise Retail Storefront configuration for the Corica Pastries shop. */
export const SUPPLIER_SLUG = 'coricapastries'

/** SupplyWise backend host (server-to-server calls go here directly). */
export const SW_DIRECT_BASE = `https://actions.supplywise.com.au/api/retail/v1/${SUPPLIER_SLUG}`

/** Same-origin proxy (see src/routes/api/sw/$.ts). Browser calls go through here so
 *  ad/privacy blockers cannot silently drop the cross-origin request. */
export const SW_PROXY_BASE = '/api/sw'

/** SupplyWise app origin, used for the shopper login (PKCE) redirect. */
export const SW_APP_URL = `https://supplywise.com.au/${SUPPLIER_SLUG}`

/** Pick the right base for where the code is running. */
export function apiBase() {
  return typeof window === 'undefined' ? SW_DIRECT_BASE : SW_PROXY_BASE
}

export const STORAGE_KEYS = {
  cart: `sw_cart_${SUPPLIER_SLUG}`,
  favourites: `sw_favourites_${SUPPLIER_SLUG}`,
  tokens: 'sw_retail_tokens',
  pkce: 'sw_pkce',
} as const
