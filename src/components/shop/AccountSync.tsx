import { useEffect } from 'react'
import { initAuth } from '#/lib/shop/auth'

/**
 * Restores the shopper session and wires the heart buttons to the account.
 *
 * Renders nothing. Mounting it runs the one-off `initAuth()`: it completes a pending
 * `?code` redirect, merges local favourites into the account and registers the remote
 * favourite toggle so hearts write through to `/account/favourites`.
 *
 * NOTE: it is currently mounted only inside `/shop/account`, so in a given session the
 * hearts on the browse pages sync remotely only after the shopper has opened the
 * account page. Mounting it once in `src/routes/shop.tsx` (the shop layout) would make
 * it sync everywhere — a one-line change for whoever owns that file.
 */
export function AccountSync() {
  useEffect(() => {
    void initAuth()
  }, [])
  return null
}
