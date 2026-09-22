import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Reveal } from '#/components/Reveal'
import { CategoryNav } from '#/components/patisserie/CategoryNav'
import { OrderCard, PriceNote } from '#/components/patisserie/OrderCard'
import { ProductCard } from '#/components/patisserie/ProductCard'
import { PageHero } from '#/components/ui'
import { catalogue, getCategoryMeta } from '#/data/catalogue'
import { shopCategory } from '#/data/shopLinks'
import { breadcrumbs, jsonLd, rangeSchema, seo } from '#/lib/seo'
import type { Category } from '#/data/catalogue'

export const Route = createFileRoute('/patisserie/$category')({
  loader: ({ params }) => {
    const category = catalogue.find((c) => c.slug === params.category)
    if (!category) throw notFound()
    return { category }
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category
    if (!category) {
      return seo({
        title: 'The Patisserie',
        description:
          'The ranges baked at Corica Pastries in Northbridge since 1957.',
        path: '/patisserie',
      })
    }
    const meta = getCategoryMeta(category.slug)
    const path = `/patisserie/${category.slug}`
    return {
      ...seo({
        title: `${meta.title ?? category.name} | Corica Pastries, Northbridge Perth`,
        description: meta.description,
        path,
        image: {
          path: meta.image,
          width: 800,
          height: 800,
          alt: meta.imageAlt,
        },
      }),
      scripts: [
        jsonLd(
          breadcrumbs([
            { name: 'The Patisserie', path: '/patisserie' },
            { name: category.name },
          ]),
        ),
        jsonLd(rangeSchema(category)),
      ],
    }
  },
  component: Page,
})

function Page() {
  const { category } = Route.useLoaderData()
  const meta = getCategoryMeta(category.slug)
  const index = catalogue.findIndex((c) => c.slug === category.slug)
  const previous = index > 0 ? catalogue[index - 1] : undefined
  const next = index < catalogue.length - 1 ? catalogue[index + 1] : undefined

  return (
    <>
      <PageHero
        eyebrow="The Patisserie"
        title={category.name}
        lede={meta.blurb}
      />
      <CategoryNav current={category.slug} />

      <section className="pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="wrap">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            <div>
              <h2 className="sr-only">Products in the {category.name} range</h2>
              <p className="text-[0.95rem] text-ink-soft">
                {category.products.length}{' '}
                {category.products.length === 1 ? 'product' : 'products'} in the{' '}
                {category.name} range.
              </p>

              <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {category.products.map((product, i) => (
                  <Reveal
                    key={product.slug}
                    delay={(i % 3) * 0.08}
                    className="h-full"
                  >
                    <ProductCard product={product} rangeName={category.name} />
                  </Reveal>
                ))}
              </div>

              <PriceNote className="mt-10" />
            </div>

            <Reveal>
              <OrderCard
                rangeName={category.name}
                shopCategory={shopCategory(category.slug)}
              />
            </Reveal>
          </div>

          <PrevNext previous={previous} next={next} />
        </div>
      </section>
    </>
  )
}

function PrevNext({
  previous,
  next,
}: {
  previous: Category | undefined
  next: Category | undefined
}) {
  return (
    <nav
      aria-label="More ranges"
      className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-gold-soft pt-8"
    >
      {previous ? (
        <Link
          to="/patisserie/$category"
          params={{ category: previous.slug }}
          className="group max-w-[45%] text-left"
        >
          <span className="block text-[0.7rem] tracking-eyebrow text-gold uppercase">
            &larr; Previous range
          </span>
          <span className="mt-1 block font-display text-[1.5rem] text-green group-hover:text-red">
            {previous.name}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <Link
        to="/patisserie"
        className="order-last w-full text-center text-[0.75rem] tracking-nav text-green uppercase sm:order-none sm:w-auto"
      >
        <span className="border-b border-gold pb-0.5 hover:text-red">
          All ranges
        </span>
      </Link>

      {next ? (
        <Link
          to="/patisserie/$category"
          params={{ category: next.slug }}
          className="group max-w-[45%] text-right"
        >
          <span className="block text-[0.7rem] tracking-eyebrow text-gold uppercase">
            Next range &rarr;
          </span>
          <span className="mt-1 block font-display text-[1.5rem] text-green group-hover:text-red">
            {next.name}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  )
}
