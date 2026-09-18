import { createFileRoute, notFound } from '@tanstack/react-router'
import { ApiError, getParent } from '#/lib/shop/api'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/shop/parent/$parentSlug')({
  loader: async ({ params }) => {
    try {
      return { detail: await getParent(params.parentSlug) }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound()
      throw err
    }
  },
  head: ({ loaderData }) =>
    seo({
      title: loaderData?.detail.parent.name ?? 'Shop',
      description: 'TODO',
      path: `/shop/parent/${loaderData?.detail.parent.slug ?? ''}`,
    }),
  component: Page,
})

function Page() {
  const { detail } = Route.useLoaderData()
  return (
    <div className="wrap py-20">TODO: variant group {detail.parent.name}</div>
  )
}
