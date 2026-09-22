import { createFileRoute, getRouteApi, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { ProductDetailView } from '#/components/shop/ProductDetailView'
import { RecommendRow } from '#/components/shop/RecommendRow'
import { VariantPicker } from '#/components/shop/VariantPicker'
import { ButtonLink } from '#/components/ui'
import { ApiError, getParent } from '#/lib/shop/api'
import {
  defaultVariantId,
  truncate,
  withRemoteOgImage,
} from '#/lib/shop/browse'
import { optionsFor, recommendations } from '#/lib/shop/catalog'
import { htmlToText } from '#/lib/shop/sanitize'
import { breadcrumbs, jsonLd, seo } from '#/lib/seo'
import { variantGroupSchema } from '#/lib/shop/schema'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/parent/$parentSlug')({
  loader: async ({ params }) => {
    try {
      return { detail: await getParent(params.parentSlug) }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound()
      throw err
    }
  },
  head: ({ loaderData }) => {
    const detail = loaderData?.detail
    if (!detail) {
      return seo({
        title: 'Shop',
        description: 'Order Corica Pastries online for pickup in Northbridge.',
        path: '/shop',
      })
    }
    const { parent, products } = detail
    const lead = products.find((p) => p.inStock) ?? products.at(0)
    const summary = truncate(
      htmlToText(parent.description || lead?.description),
    )
    const sizes = parent.products.map((m) => m.displayName).join(', ')
    const path = parent.slug ? `/shop/parent/${parent.slug}` : '/shop'
    const head = withRemoteOgImage(
      seo({
        title: parent.name,
        description:
          summary ||
          `${parent.name} from Corica Pastries, Northbridge${sizes ? ` — ${sizes}` : ''}. Order online for pickup from 106 Aberdeen Street.`,
        path,
        type: 'product',
      }),
      lead?.image ?? parent.image,
    )
    return {
      ...head,
      scripts: [
        jsonLd(variantGroupSchema(parent, products, path)),
        jsonLd(
          breadcrumbs([{ name: 'Shop', path: '/shop' }, { name: parent.name }]),
        ),
      ],
    }
  },
  component: Page,
})

function Page() {
  const { detail } = Route.useLoaderData()
  const { store } = shopRoute.useLoaderData()
  const { parent, products } = detail

  const [selectedId, setSelectedId] = useState(
    () => defaultVariantId(products) ?? '',
  )
  const selected = products.find((p) => p.id === selectedId) ?? products.at(0)

  const recommended = recommendations(
    store,
    detail.recommendedProductIds,
    products.map((p) => p.id),
    4,
  )

  // A group whose members are all unlisted upstream has nothing to sell.
  if (!selected) return <Unavailable name={parent.name} />

  // Fallback chain from the spec: the selected member's gallery, then the group's.
  // The spec's last step is the supplier logo, which is the Corica logo itself and
  // crops badly in a square frame — an empty gallery shows the muted logo tile instead.
  const images = selected.images.length > 0 ? selected.images : parent.images

  const categories = store.categories.filter((c) =>
    selected.categoryIds.includes(c.id),
  )

  return (
    <>
      <ProductDetailView
        title={parent.name}
        product={selected}
        images={images}
        description={selected.description || parent.description}
        options={optionsFor(detail, selected.id)}
        subscribable={selected.subscribable || parent.subscribable}
        displayName={`${parent.name} — ${selected.displayName}`}
        categories={categories}
        variantPicker={
          <VariantPicker
            label={parent.selectionLabel?.trim() || 'Choose a size'}
            members={products}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
        }
      />
      <RecommendRow items={recommended} store={store} />
    </>
  )
}

function Unavailable({ name }: { name: string }) {
  return (
    <section className="wrap py-24 text-center">
      <h1 className="text-[clamp(2rem,4vw,2.8rem)]">{name}</h1>
      <p className="mx-auto mt-4 max-w-[46ch] text-ink-soft">
        None of the sizes for this item can be ordered online at the moment.
      </p>
      <ButtonLink to="/shop" variant="solid" className="mt-8">
        Back to the shop
      </ButtonLink>
    </section>
  )
}
