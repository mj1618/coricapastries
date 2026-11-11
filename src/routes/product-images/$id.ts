import { createFileRoute } from '@tanstack/react-router'

/**
 * A SupplyWise product photo served from our own domain, for the Merchant Center
 * feed (see ownImageUrl() in src/lib/shop/merchantFeed.ts). SupplyWise's getImage
 * link answers with a redirect to a Convex storage host, and Merchant Center
 * rejected every one as "Invalid image encoding"; here the bytes come back in one
 * 200 with a real image content type. Storage ids are content-addressed, so the
 * response is cached for a long time at the edge.
 */
const ID = /^[a-z0-9]{20,64}$/

async function image({ params }: { params: { id: string } }) {
  if (!ID.test(params.id)) return new Response('Not found', { status: 404 })
  try {
    const up = await fetch(
      `https://actions.supplywise.com.au/getImage/${params.id}`,
      { redirect: 'follow' },
    )
    const type = up.headers.get('content-type') ?? ''
    if (!up.ok || !type.startsWith('image/')) {
      return new Response('Not found', {
        status: 404,
        headers: { 'cache-control': 'public, s-maxage=300' },
      })
    }
    return new Response(await up.arrayBuffer(), {
      headers: {
        'content-type': type,
        'cache-control':
          'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[product-images] upstream unreachable', err)
    return new Response('Upstream unavailable', { status: 502 })
  }
}

export const Route = createFileRoute('/product-images/$id')({
  server: { handlers: { GET: image } },
})
