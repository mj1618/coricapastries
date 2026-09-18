import { useSyncExternalStore } from 'react'
import { ApiError, BLOCKER_HINT, authedRequest, isNetworkError } from './api'
import { STORAGE_KEYS, SW_APP_URL, SW_PROXY_BASE } from './config'
import {
  getFavourites,
  setFavourites,
  setRemoteFavouriteToggle,
} from './favourites'
import type { Order, OrderSummary, Subscription, Tokens } from './types'

/**
 * Shopper login for the SupplyWise "retail" grant (see the storefront guide §3b).
 *
 * Authorization-code + PKCE. The verifier and CSRF state live in sessionStorage for
 * the round trip; the returned token pair lives in localStorage. Every browser call —
 * the token exchange included — goes through our same-origin proxy (/api/sw) so a
 * privacy blocker cannot silently drop it (§8 A7).
 *
 * Tokens are never logged and never placed in a URL.
 */

/* ------------------------------------------------------------------ store ---- */

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

/** `GET /account/profile` → `{ user, customer, venue }`. The exact member fields are
 *  not pinned down by the guide, so everything is read defensively. */
export type AccountProfile = {
  user?: Record<string, unknown> | null
  customer?: Record<string, unknown> | null
  venue?: Record<string, unknown> | null
}

type AuthState = {
  status: AuthStatus
  profile: AccountProfile | null
  /** Human-readable problem with the last sign-in attempt, shown on the account page. */
  error: string | null
}

const INITIAL: AuthState = { status: 'loading', profile: null, error: null }

let state: AuthState = INITIAL
const listeners = new Set<() => void>()

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

const getSnapshot = () => state
const getServerSnapshot = () => INITIAL

/* ------------------------------------------------------------ token store ---- */

export function getTokens(): Tokens | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tokens)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Tokens | null
    return parsed && typeof parsed.access_token === 'string' ? parsed : null
  } catch {
    return null
  }
}

function storeTokens(tokens: Tokens) {
  try {
    localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens))
  } catch {
    // Private mode / storage disabled: the session lasts for this page only.
  }
}

function clearStoredTokens() {
  try {
    localStorage.removeItem(STORAGE_KEYS.tokens)
  } catch {
    // ignore
  }
}

export function isLoggedIn() {
  return getTokens() !== null
}

/* -------------------------------------------------------------- utilities ---- */

function b64url(buf: ArrayBuffer) {
  let s = ''
  for (const byte of new Uint8Array(buf)) s += String.fromCharCode(byte)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomString() {
  return b64url(crypto.getRandomValues(new Uint8Array(48)).buffer)
}

function sha256(value: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
}

/** Turns any thrown value into something we can show a shopper. */
export function describeError(err: unknown, fallback: string) {
  if (isNetworkError(err)) return `${fallback} ${BLOCKER_HINT}`
  if (err instanceof ApiError) return err.message
  return fallback
}

/* --------------------------------------------------------- token endpoint ---- */

async function tokenRequest(body: Record<string, string>): Promise<Tokens> {
  const res = await fetch(`${SW_PROXY_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string } } | null)
      ?.error
    throw new ApiError(
      res.status,
      err?.code ?? `http_${res.status}`,
      err?.message ??
        `The sign-in service refused the request (${res.status}).`,
    )
  }
  const tokens = json as Tokens | null
  if (!tokens || typeof tokens.access_token !== 'string') {
    throw new ApiError(
      res.status,
      'invalid_token_response',
      'The sign-in service returned an unexpected response.',
    )
  }
  return tokens
}

/* ------------------------------------------------------------- PKCE login ---- */

/** The redirect target. Must be byte-identical at authorize time and token exchange. */
export const ACCOUNT_PATH = '/shop/account'

export function redirectUri() {
  return `${window.location.origin}${ACCOUNT_PATH}`
}

export function authorizeUrl(params: {
  redirectUri: string
  state: string
  codeChallenge: string
}) {
  const url = new URL(`${SW_APP_URL}/retail/authorize`)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

type PkceStash = { verifier: string; state: string; redirectUri: string }

/** Starts the login: stashes the PKCE pair, then leaves for SupplyWise. */
export async function login() {
  try {
    const verifier = randomString()
    const csrfState = randomString()
    const stash: PkceStash = {
      verifier,
      state: csrfState,
      redirectUri: redirectUri(),
    }
    sessionStorage.setItem(STORAGE_KEYS.pkce, JSON.stringify(stash))
    const codeChallenge = b64url(await sha256(verifier))
    setState({ error: null })
    window.location.assign(
      authorizeUrl({
        redirectUri: stash.redirectUri,
        state: csrfState,
        codeChallenge,
      }),
    )
  } catch {
    setState({
      error:
        'Could not start the sign-in on this device. Browser storage or the Web Crypto API may be unavailable (private browsing can cause this).',
    })
  }
}

function readPkceStash(): PkceStash | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.pkce)
    return raw ? (JSON.parse(raw) as PkceStash) : null
  } catch {
    return null
  }
}

function clearPkceStash() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.pkce)
  } catch {
    // ignore
  }
}

/**
 * Handles `?code` / `?error` on the account page. Always strips the query string from
 * the URL first, so an authorization code never lingers in history or a shared link.
 */
export async function handleRedirect(): Promise<void> {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const errorParam = params.get('error')
  if (!code && !errorParam) return

  const returnedState = params.get('state')
  const stash = readPkceStash()
  window.history.replaceState(null, '', window.location.pathname)
  clearPkceStash()

  if (errorParam) {
    setState({
      status: 'anonymous',
      error:
        errorParam === 'access_denied'
          ? 'Sign-in was cancelled, so you are still browsing as a guest. You can try again at any time.'
          : `SupplyWise could not sign you in (${errorParam}). Please try again.`,
    })
    return
  }
  if (!stash?.verifier || !returnedState || returnedState !== stash.state) {
    setState({
      status: 'anonymous',
      error:
        'Sign-in could not be completed because the security check did not match. Please try again.',
    })
    return
  }
  try {
    const tokens = await tokenRequest({
      grant_type: 'authorization_code',
      code: code as string,
      code_verifier: stash.verifier,
      redirect_uri: stash.redirectUri,
    })
    storeTokens(tokens)
    setState({ status: 'authenticated', error: null })
  } catch (err) {
    setState({
      status: 'anonymous',
      error: describeError(err, 'Could not complete the sign-in.'),
    })
  }
}

/* ----------------------------------------------------------------- tokens ---- */

// Refresh tokens rotate on use and reusing an old one revokes the session, so only
// ever one refresh may be in flight.
let refreshing: Promise<boolean> | null = null

export function refresh(): Promise<boolean> {
  if (refreshing) return refreshing
  refreshing = (async () => {
    const current = getTokens()
    if (!current?.refresh_token) {
      doLogout()
      return false
    }
    try {
      const tokens = await tokenRequest({
        grant_type: 'refresh_token',
        refresh_token: current.refresh_token,
      })
      // Always overwrite with the newly returned pair.
      storeTokens(tokens)
      return true
    } catch (err) {
      // A blocked/offline request is not a rejected token: keep the session.
      if (!isNetworkError(err)) doLogout()
      return false
    }
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

export function logout() {
  doLogout()
  setState({ error: null })
}

function doLogout() {
  clearStoredTokens()
  setRemoteFavouriteToggle(null)
  setState({ status: 'anonymous', profile: null })
}

/* --------------------------------------------------- authenticated calls ---- */

/** Authenticated `/account/*` call through the proxy, refreshing once on a 401. */
export async function accountFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const tokens = getTokens()
  if (!tokens) {
    doLogout()
    throw new ApiError(401, 'not_logged_in', 'You are not signed in.')
  }
  try {
    return await authedRequest<T>(path, tokens.access_token, init)
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err
    if (await refresh()) {
      const next = getTokens()
      if (next) return await authedRequest<T>(path, next.access_token, init)
    }
    doLogout()
    throw new ApiError(
      401,
      'session_expired',
      'Your session has expired. Please log in again.',
    )
  }
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export function getProfile() {
  return accountFetch<AccountProfile>('/account/profile')
}

export function getAccountFavourites() {
  return accountFetch<{ productIds: string[] }>('/account/favourites')
}

export function addFavourite(productId: string) {
  return accountFetch<unknown>('/account/favourites', json({ productId }))
}

export function removeFavourite(productId: string) {
  return accountFetch<unknown>(
    `/account/favourites/${encodeURIComponent(productId)}`,
    { method: 'DELETE' },
  )
}

export function getPreviouslyOrdered() {
  return accountFetch<{ previouslyOrdered: Record<string, number> }>(
    '/account/previously-ordered',
  )
}

export function getOrders() {
  return accountFetch<{ orders: OrderSummary[] }>('/account/orders')
}

/** The guide is not explicit about whether the order is wrapped, so accept both. */
export async function getOrder(orderId: string): Promise<Order> {
  const data = await accountFetch<Order | { order: Order }>(
    `/account/orders/${encodeURIComponent(orderId)}`,
  )
  return (data as { order?: Order }).order ?? (data as Order)
}

export function getSubscriptions() {
  return accountFetch<{ subscriptions: Subscription[] }>(
    '/account/subscriptions',
  )
}

function subscriptionAction(id: string, action: string) {
  return accountFetch<unknown>(
    `/account/subscriptions/${encodeURIComponent(id)}/${action}`,
    { method: 'POST' },
  )
}

export const pauseSubscription = (id: string) => subscriptionAction(id, 'pause')
export const resumeSubscription = (id: string) =>
  subscriptionAction(id, 'resume')
export const cancelSubscription = (id: string) =>
  subscriptionAction(id, 'cancel')

/* ------------------------------------------------------------- favourites ---- */

/**
 * Merge (guide §8 A3): push any local-only favourites into the account, then treat
 * server ∪ local as the list. Runs after a token exchange and on every app load
 * while logged in.
 */
export async function syncFavourites() {
  const local = getFavourites()
  const { productIds } = await getAccountFavourites()
  const server = Array.isArray(productIds) ? productIds : []
  const onServer = new Set(server)
  const localOnly = local.filter((id) => !onServer.has(id))
  await Promise.allSettled(localOnly.map((id) => addFavourite(id)))
  setFavourites([...server, ...localOnly])
}

/** Makes the heart buttons write through to the account while logged in. */
function registerRemoteFavourites() {
  setRemoteFavouriteToggle(async (productId, on) => {
    if (!isLoggedIn()) return
    if (on) await addFavourite(productId)
    else await removeFavourite(productId)
  })
}

/* ------------------------------------------------------------------- init ---- */

async function loadProfile() {
  try {
    setState({ profile: await getProfile() })
  } catch {
    // A 401 already logged us out; anything else just leaves the greeting generic.
  }
}

let initialised = false

/**
 * Completes a pending redirect, then restores the session. Idempotent — mounted from
 * <AccountSync /> and from the account route.
 */
export async function initAuth() {
  if (initialised || typeof window === 'undefined') return
  initialised = true
  await handleRedirect()
  if (isLoggedIn()) {
    setState({ status: 'authenticated' })
    registerRemoteFavourites()
    await Promise.allSettled([loadProfile(), syncFavourites()])
  } else if (state.status === 'loading') {
    setState({ status: 'anonymous' })
  }
}

/* ------------------------------------------------------------------- hook ---- */

export function useAuth() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
  return {
    status: snapshot.status,
    profile: snapshot.profile,
    error: snapshot.error,
    login,
    logout,
  }
}

export function clearAuthError() {
  setState({ error: null })
}

/* ---------------------------------------------------------------- display ---- */

function pick(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== 'object') return null
  const record = source as Record<string, unknown>
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/** Best available name for a greeting, or null when the profile says nothing useful. */
export function profileName(profile: AccountProfile | null): string | null {
  if (!profile) return null
  for (const source of [profile.user, profile.customer, profile.venue]) {
    const name = pick(source, ['firstName', 'name', 'fullName', 'displayName'])
    if (name) return name.split(' ')[0]
  }
  return null
}

export function profileEmail(profile: AccountProfile | null): string | null {
  if (!profile) return null
  for (const source of [profile.user, profile.customer, profile.venue]) {
    const email = pick(source, ['email', 'emailAddress'])
    if (email) return email
  }
  return null
}
