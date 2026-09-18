import { createFileRoute, notFound } from '@tanstack/react-router'
import { ApiError, getProduct } from '#/lib/shop/api'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/shop/$slug')({
  loader: async ({ params }) => {
    try {
      return { detail: await getProduct(params.slug) }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound()
      throw err
    }
  },
  head: ({ loaderData }) =>
    seo({
      title: loaderData?.detail.product.name ?? 'Shop',
      description: 'TODO',
      path: `/shop/${loaderData?.detail.product.slug ?? ''}`,
    }),
  component: Page,
})

function Page() {
  const { detail } = Route.useLoaderData()
  return <div className="wrap py-20">TODO: product {detail.product.name}</div>
}
