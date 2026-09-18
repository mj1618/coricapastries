import { createFileRoute } from '@tanstack/react-router'
import { SW_DIRECT_BASE } from '#/lib/shop/config'

/**
 * Same-origin proxy to the SupplyWise Retail Storefront API.
 * The browser only ever talks to this domain, so ad/privacy blockers that drop
 * cross-site requests cannot break checkout. Forwards method, body, query,
 * Content-Type and Authorization; returns the upstream status and body unchanged.
 */
async function proxy({
  request,
  params,
}: {
  request: Request
  params: { _splat?: string }
}) {
  const path = (params._splat ?? '')
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')
  const url = `${SW_DIRECT_BASE}/${path}${new URL(request.url).search}`
  const headers: Record<string, string> = { Accept: 'application/json' }
  const ct = request.headers.get('content-type')
  if (ct) headers['Content-Type'] = ct
  const az = request.headers.get('authorization')
  if (az) headers['Authorization'] = az
  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.text()
  try {
    const up = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    })
    return new Response(await up.text(), {
      status: up.status,
      headers: {
        'Content-Type': up.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[sw-proxy] upstream unreachable', err)
    return new Response(
      JSON.stringify({
        error: {
          code: 'upstream_unreachable',
          message: 'Could not reach the store service. Please try again.',
        },
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

export const Route = createFileRoute('/api/sw/$')({
  server: {
    handlers: {
      GET: proxy,
      POST: proxy,
      DELETE: proxy,
      PUT: proxy,
      PATCH: proxy,
    },
  },
})
