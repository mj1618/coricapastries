import { createFileRoute } from '@tanstack/react-router'
import { catalogue } from '#/data/catalogue'
import { site } from '#/data/site'

/**
 * The XML sitemap: the brochure pages and the shop front. Shop product URLs
 * are left out on purpose (their slugs come from supplier data that still
 * has duplicates) and the cart and account pages are noindex.
 */
const PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/patisserie', priority: '0.9', changefreq: 'monthly' },
  ...catalogue.map((c) => ({
    path: `/patisserie/${c.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  ...catalogue.flatMap((c) =>
    c.products.map((p) => ({
      path: `/patisserie/${c.slug}/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ),
  { path: '/shop', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'yearly' },
  { path: '/faqs', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
]

function xml(): string {
  const urls = PAGES.map(
    (p) =>
      `  <url><loc>${site.siteUrl}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(xml(), {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        }),
    },
  },
})
