import {
  Link,
  createFileRoute,
  getRouteApi,
  notFound,
} from '@tanstack/react-router'
import { ProductDetailView } from '#/components/shop/ProductDetailView'
import { RecommendRow } from '#/components/shop/RecommendRow'
import { ApiError, getProduct } from '#/lib/shop/api'
import { truncate, withRemoteOgImage } from '#/lib/shop/browse'
import { recommendations } from '#/lib/shop/catalog'
import { htmlToText } from '#/lib/shop/sanitize'
import { seo } from '#/lib/seo'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/$slug')({
  loader: async ({ params }) => {
    try {
      return { detail: await getProduct(params.slug) }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound()
      throw err
    }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.detail.product
    if (!product) {
      return seo({
        title: 'Shop',
        description: 'Order Corica Pastries online for pickup in Northbridge.',
        path: '/shop',
      })
    }
    const summary = truncate(htmlToText(product.description))
    return withRemoteOgImage(
      seo({
        title: product.name,
        description:
          summary ||
          `${product.name} from Corica Pastries, Northbridge. Order online for pickup from 106 Aberdeen Street.`,
        path: `/shop/${product.slug ?? ''}`,
      }),
      product.image,
    )
  },
  component: Page,
})

function Page() {
  const { detail } = Route.useLoaderData()
  const { store } = shopRoute.useLoaderData()
  const { product, options, variantGroup } = detail

  const categories = store.categories.filter((c) =>
    product.categoryIds.includes(c.id),
  )
  // No photo yet: GalleryViewer shows the muted logo tile. (The spec's last-resort
  // fallback is the supplier logo, but that is the Corica logo itself and crops badly
  // in a square frame — the tile shows the same mark, uncropped and toned back.)
  const images = product.images

  const recommended = recommendations(
    store,
    detail.recommendedProductIds,
    [product.id],
    4,
  )

  return (
    <>
      <ProductDetailView
        title={product.name}
        product={product}
        images={images}
        description={product.description}
        options={options}
        subscribable={product.subscribable}
        categories={categories}
        belowDescription={
          variantGroup?.slug ? (
            <p className="mt-5 border-t border-gold-soft pt-5 text-[0.98rem] text-ink-soft">
              Also available as{' '}
              <Link
                to="/shop/parent/$parentSlug"
                params={{ parentSlug: variantGroup.slug }}
                className="link-gold"
              >
                {otherSizes(variantGroup, product.id)}
              </Link>
              .
            </p>
          ) : null
        }
      />
      <RecommendRow items={recommended} store={store} />
    </>
  )
}

/** "Small, Large" — the sizes in this product's group other than the one shown. */
function otherSizes(
  group: {
    name: string
    products: { productId: string; displayName: string }[]
  },
  currentId: string,
) {
  const others = group.products
    .filter((m) => m.productId !== currentId)
    .map((m) => m.displayName)
  if (others.length === 0) return group.name
  return `${group.name} — ${others.join(', ')}`
}
