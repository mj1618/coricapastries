import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '#/lib/shop/api'
import { localInventoryFeed } from '#/lib/shop/merchantFeed'

/**
 * Merchant Center's local inventory feed (store code 30301), fetched daily by the
 * "Corica local inventory" data source. 503 on failure, as for the product feed.
 */
export const Route = createFileRoute('/merchant-local-inventory.xml')({
  server: {
    handlers: {
      GET: async () => {
        try {
          return new Response(localInventoryFeed(await getStore()), {
            headers: {
              'content-type': 'application/xml; charset=utf-8',
              'cache-control': 'public, s-maxage=3600',
            },
          })
        } catch (err) {
          console.error('[merchant-local-inventory] store unavailable', err)
          return new Response('Store unavailable', { status: 503 })
        }
      },
    },
  },
})
