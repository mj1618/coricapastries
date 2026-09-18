import { useCallback, useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from './config'

// Favourites for anonymous shoppers live in localStorage. When a shopper logs in,
// auth.ts merges these into the account and mirrors the server list back here.

const listeners = new Set<() => void>()
let cache: string[] | null = null
const EMPTY: string[] = []

function readLocal(): string[] {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favourites)
    cache = raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    cache = []
  }
  return cache
}

export function setFavourites(ids: string[]) {
  cache = [...new Set(ids)]
  try {
    localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify(cache))
  } catch {
    // ignore
  }
  listeners.forEach((l) => l())
}

export function getFavourites() {
  return typeof window === 'undefined' ? EMPTY : readLocal()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.favourites) {
      cache = null
      cb()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

/** Optional hook set by auth.ts so toggles also hit the account API when logged in. */
let remoteToggle: ((productId: string, on: boolean) => Promise<void>) | null =
  null
export function setRemoteFavouriteToggle(fn: typeof remoteToggle) {
  remoteToggle = fn
}

export function useFavourites() {
  const ids = useSyncExternalStore(subscribe, getFavourites, () => EMPTY)
  const isFavourite = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback((id: string) => {
    const on = !readLocal().includes(id)
    setFavourites(
      on ? [...readLocal(), id] : readLocal().filter((x) => x !== id),
    )
    remoteToggle?.(id, on).catch(() => {
      // Roll back the optimistic update if the account call fails.
      setFavourites(
        on ? readLocal().filter((x) => x !== id) : [...readLocal(), id],
      )
    })
  }, [])
  return { ids, isFavourite, toggle }
}
