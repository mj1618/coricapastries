import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

/**
 * Catch-all for URLs no other route matches. It exists only so a 404 carries
 * its own title and a noindex instead of inheriting the site defaults; the
 * page itself is the root route's notFoundComponent, and the status is 404.
 */
export const Route = createFileRoute('/$')({
  loader: () => {
    throw notFound()
  },
  head: () =>
    seo({
      title: 'Page not found',
      description:
        'That page is not on the Corica Pastries website. Browse the patisserie, order online for pickup in Northbridge, or call the shop.',
      path: '/',
      noindex: true,
    }),
})
