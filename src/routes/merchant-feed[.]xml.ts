import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '#/lib/shop/api'
import { productFeed } from '#/lib/shop/merchantFeed'

/**
 * Merchant Center's primary product feed, fetched daily by the "Corica website
 * products" data source. A failure returns 503 so Google keeps the last good
 * fetch instead of reading an empty feed as "every product removed".
 */
export const Route = createFileRoute('/merchant-feed.xml')({
  server: {
    handlers: {
      GET: async () => {
        try {
          return new Response(productFeed(await getStore()), {
            headers: {
              'content-type': 'application/xml; charset=utf-8',
              'cache-control': 'public, s-maxage=3600',
            },
          })
        } catch (err) {
          console.error('[merchant-feed] store unavailable', err)
          return new Response('Store unavailable', { status: 503 })
        }
      },
    },
  },
})
