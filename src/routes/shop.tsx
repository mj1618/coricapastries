import { Outlet, createFileRoute } from '@tanstack/react-router'
import { getStore } from '#/lib/shop/api'
import { AccountSync } from '#/components/shop/AccountSync'

/**
 * Layout for every /shop route. Loads the whole-store snapshot once (server-side on
 * the first request, via the same-origin proxy on client navigation) and shares it
 * with children through `Route.useLoaderData()` / `useLoaderData({ from: '/shop' })`.
 * Shop pages are not prerendered (see vite.config.ts) so prices and stock stay live.
 */
export const Route = createFileRoute('/shop')({
  loader: async () => ({ store: await getStore(), loadedAt: Date.now() }),
  staleTime: 60_000,
  headers: () => ({
    'cache-control': 'public, s-maxage=60, stale-while-revalidate=600',
  }),
  component: () => (
    <>
      <AccountSync />
      <Outlet />
    </>
  ),
})
