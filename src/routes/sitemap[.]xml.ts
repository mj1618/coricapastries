import { createFileRoute } from '@tanstack/react-router'
import { catalogue } from '#/data/catalogue'
import { site } from '#/data/site'
import { isCanonicalProduct, productPath } from '#/lib/seo'
import { getStore } from '#/lib/shop/api'
import { gridItems } from '#/lib/shop/catalog'

/**
 * The XML sitemap: the brochure pages (canonical URLs only), the shop front and the
 * shop's product pages, one URL per grid tile (a variant group is listed at its group
 * page, not once per size). The cart and account pages are noindex.
 */
type Page = { path: string; priority: string; changefreq: string }

const PAGES: Page[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/patisserie', priority: '0.9', changefreq: 'monthly' },
  ...catalogue.map((c) => ({
    path: `/patisserie/${c.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  // A product listed in two ranges appears once, at its canonical page.
  ...catalogue.flatMap((c) =>
    c.products
      .filter((p) => isCanonicalProduct(c.slug, p.slug))
      .map((p) => ({
        path: productPath(c.slug, p.slug),
        priority: '0.7',
        changefreq: 'monthly',
      })),
  ),
  { path: '/shop', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'yearly' },
  { path: '/apple-strudel-history', priority: '0.6', changefreq: 'yearly' },
  { path: '/faqs', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
]

/** Live from SupplyWise; if it cannot be reached the sitemap still lists everything else. */
async function shopPages(): Promise<Page[]> {
  try {
    return gridItems(await getStore()).flatMap((item) => {
      const slug = item.kind === 'group' ? item.group.slug : item.product.slug
      if (!slug) return []
      const path =
        item.kind === 'group' ? `/shop/parent/${slug}` : `/shop/${slug}`
      return [{ path, priority: '0.6', changefreq: 'weekly' }]
    })
  } catch (err) {
    console.error('[sitemap] shop products unavailable', err)
    return []
  }
}

async function xml(): Promise<string> {
  const urls = [...PAGES, ...(await shopPages())]
    .map(
      (p) =>
        `  <url><loc>${site.siteUrl}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(await xml(), {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        }),
    },
  },
})
