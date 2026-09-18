import { site } from '#/data/site'

/** Builds the `head()` meta for a page. Titles are suffixed with the business name. */
export function seo({
  title,
  description,
  path = '/',
  image = '/img/strudel-hero.png',
}: {
  title: string
  description: string
  path?: string
  image?: string
}) {
  const fullTitle = title === site.name ? title : `${title} | ${site.name}`
  const url = `${site.siteUrl}${path}`
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: `${site.siteUrl}${image}` },
      { property: 'og:locale', content: 'en_AU' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
