import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Reveal } from '#/components/Reveal'
import { PriceNote } from '#/components/patisserie/OrderCard'
import {
  PriceBlock,
  ProductCard,
  rangeLabel,
} from '#/components/patisserie/ProductCard'
import { Eyebrow, Ornament } from '#/components/ui'
import { catalogue } from '#/data/catalogue'
import { shopCategory } from '#/data/shopLinks'
import { site } from '#/data/site'
import { breadcrumbs, jsonLd, productPath, productSchema, seo } from '#/lib/seo'
import type { Category, Product } from '#/data/catalogue'

/**
 * One product from the brochure catalogue, at /patisserie/<range>/<product>.
 * The old WordPress site had a page per product and those URLs still rank, so
 * these are their redirect targets; the path scheme is fixed. Everything shown
 * comes from src/data/catalogue.ts and src/data/site.ts.
 */
export const Route = createFileRoute('/patisserie/$category_/$product')({
  loader: ({ params }) => {
    const category = catalogue.find((c) => c.slug === params.category)
    if (!category) throw notFound()
    const product = category.products.find((p) => p.slug === params.product)
    if (!product) throw notFound()
    return { category, product }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return seo({
        title: 'The Patisserie',
        description:
          'The ranges baked at Corica Pastries in Northbridge since 1957.',
        path: '/patisserie',
      })
    }
    const { category, product } = loaderData
    const path = productPath(category.slug, product.slug)
    const description = productDescription(category, product)
    return {
      ...seo({
        title: `${product.name} | Corica Pastries, Northbridge Perth`,
        description,
        path,
        type: 'product',
        image: {
          path: product.image,
          width: 800,
          height: 800,
          alt: imageAlt(category, product),
        },
      }),
      scripts: [
        jsonLd(productSchema(category, product, description)),
        jsonLd(
          breadcrumbs([
            { name: 'The Patisserie', path: '/patisserie' },
            { name: category.name, path: `/patisserie/${category.slug}` },
            { name: product.name },
          ]),
        ),
      ],
    }
  },
  component: Page,
})

/** The product's own words where we have them, otherwise a plain factual line. */
function productDescription(category: Category, product: Product): string {
  return (
    product.description ||
    `${product.name} — ${category.name} baked at ${site.name}. Order online for pickup from ${site.address.street}, ${site.address.suburb}.`
  )
}

function imageAlt(category: Category, product: Product): string {
  return `${product.name}, from the ${rangeLabel(category.name)} at ${site.name}, ${site.address.suburb}`
}

function Page() {
  const { category, product } = Route.useLoaderData()
  const more = category.products
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3)

  return (
    <article className="pt-6 pb-16 md:pt-8 md:pb-20">
      <div className="wrap">
        <Crumbs category={category} product={product} />

        <div className="mt-6 grid items-start gap-10 md:mt-8 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="frame-card p-3 sm:p-4">
              <img
                src={product.image}
                alt={imageAlt(category, product)}
                width={800}
                height={800}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="aspect-square w-full bg-white object-cover"
              />
            </div>
          </Reveal>

          <div>
            <Eyebrow green>
              <Link
                to="/patisserie/$category"
                params={{ category: category.slug }}
                className="hover:text-red"
              >
                {category.name}
              </Link>
            </Eyebrow>

            <h1 className="mt-2 text-[clamp(2rem,4vw,2.9rem)] text-balance">
              {product.name}
            </h1>
            <Ornament className="my-5 justify-start" />

            {product.description ? (
              <p className="max-w-[46ch] text-[1.1rem] leading-relaxed text-pretty text-ink-soft">
                {product.description}
              </p>
            ) : null}

            <div className="mt-6 max-w-[26rem]">
              <PriceBlock product={product} />
            </div>

            {product.note ? (
              <p className="mt-5 max-w-[46ch] text-[0.85rem] leading-snug text-pretty text-ink-soft/85 italic">
                {product.note}
              </p>
            ) : null}

            <OrderPanel category={category} product={product} />
          </div>
        </div>

        <PriceNote className="mt-10" />

        {more.length > 0 ? (
          <MoreFromRange category={category} products={more} />
        ) : (
          <BackToRange category={category} className="mt-14" />
        )}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------ breadcrumb -- */

function Crumbs({
  category,
  product,
}: {
  category: Category
  product: Product
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-[0.75rem] tracking-nav uppercase"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">
        <li>
          <Link to="/" className="hover:text-green">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to="/patisserie" className="hover:text-green">
            The Patisserie
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            to="/patisserie/$category"
            params={{ category: category.slug }}
            className="hover:text-green"
          >
            {category.name}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-green normal-case">{product.name}</li>
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------ order card -- */

function OrderPanel({
  category,
  product,
}: {
  category: Category
  product: Product
}) {
  const shopKey = shopCategory(category.slug)
  return (
    <aside className="frame-card mt-8 p-6 sm:p-7">
      <h2 className="text-[1.5rem]">Order {product.name}</h2>

      <p className="mt-2 text-[1rem] text-ink-soft">
        Order online for pickup from the shop, call us and one of our team will
        take your order, or come in and buy over the counter.
      </p>

      <Link
        to="/shop"
        search={{ category: shopKey }}
        className="btn btn-solid mt-5 w-full sm:w-auto"
      >
        Order online for pickup
      </Link>

      <p className="mt-5 text-[1rem] text-ink-soft">
        or call the shop on{' '}
        <a href={site.phone.href} className="link-gold whitespace-nowrap">
          {site.phone.display}
        </a>
      </p>

      <p className="mt-3 text-[0.95rem] text-ink-soft">
        Orders are collected from {site.address.street}, {site.address.suburb};
        there is no home delivery.
      </p>
    </aside>
  )
}

/* ------------------------------------------------------------- more/back -- */

function MoreFromRange({
  category,
  products,
}: {
  category: Category
  products: Product[]
}) {
  return (
    <section className="mt-16 border-t border-gold-soft pt-12 md:mt-20">
      <Reveal className="text-center">
        <Eyebrow green>More from the {rangeLabel(category.name)}</Eyebrow>
        <h2 className="mx-auto mt-2 max-w-[24ch] text-[clamp(1.7rem,3vw,2.4rem)]">
          You might also like
        </h2>
        <Ornament />
      </Reveal>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
            <ProductCard
              product={p}
              categorySlug={category.slug}
              rangeName={category.name}
            />
          </Reveal>
        ))}
      </div>

      <BackToRange category={category} className="mt-10 text-center" />
    </section>
  )
}

function BackToRange({
  category,
  className = '',
}: {
  category: Category
  className?: string
}) {
  return (
    <p className={className}>
      <Link
        to="/patisserie/$category"
        params={{ category: category.slug }}
        className="border-b border-gold pb-0.5 text-[0.75rem] tracking-nav text-green uppercase transition-colors hover:text-red"
      >
        See the whole {rangeLabel(category.name)}
      </Link>
    </p>
  )
}
