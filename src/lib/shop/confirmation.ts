import { STORAGE_KEYS } from './config'

/** The hosted checkout returns the shopper to this exact path with `?token=`. */
export const CONFIRMATION_PATH = '/shop/order-confirmation'

/**
 * Inline head script, run before Google Tag Manager loads (see __root.tsx). The
 * confirmation token reads the order without a login, so it must never reach
 * analytics: this moves it out of the address bar into sessionStorage (so a reload
 * still works) before any tag can read the page URL.
 */
export const stashConfirmationTokenSnippet = `try{if(location.pathname.replace(/\\/$/,'')==='${CONFIRMATION_PATH}'){var t=new URLSearchParams(location.search).get('token');if(t){window.__swConfirmationToken=t;history.replaceState(history.state,'','${CONFIRMATION_PATH}');sessionStorage.setItem('${STORAGE_KEYS.confirmationToken}',t)}}}catch(e){}`

/** The token for this visit: from the head script, a reload, or the URL itself. */
export function readConfirmationToken(): string | null {
  const stashed = (window as unknown as { __swConfirmationToken?: string })
    .__swConfirmationToken
  if (stashed) return stashed
  const inUrl = new URLSearchParams(window.location.search).get('token')
  if (inUrl) {
    // Reached without the head script (a client-side navigation): strip it now.
    window.history.replaceState(window.history.state, '', CONFIRMATION_PATH)
    try {
      sessionStorage.setItem(STORAGE_KEYS.confirmationToken, inUrl)
    } catch {
      // Storage unavailable; the token still works for this render.
    }
    return inUrl
  }
  try {
    return sessionStorage.getItem(STORAGE_KEYS.confirmationToken)
  } catch {
    return null
  }
}

const REMEMBERED = 20

/**
 * True the first time this browser sees a confirmed order, and records it. The
 * page can be reloaded for 24 hours; only the first sighting may clear the cart
 * (the shopper may have started a new one since) and report the purchase.
 */
export function firstConfirmation(orderId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.confirmedOrders)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const seen = Array.isArray(parsed) ? (parsed as string[]) : []
    if (seen.includes(orderId)) return false
    localStorage.setItem(
      STORAGE_KEYS.confirmedOrders,
      JSON.stringify([...seen, orderId].slice(-REMEMBERED)),
    )
    return true
  } catch {
    // Storage unavailable: nothing persists, so there is no earlier sighting.
    return true
  }
}
