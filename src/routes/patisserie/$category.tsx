import { createFileRoute, notFound } from '@tanstack/react-router'
import { catalogue } from '#/data/catalogue'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/patisserie/$category')({
  loader: ({ params }) => {
    const category = catalogue.find((c) => c.slug === params.category)
    if (!category) throw notFound()
    return { category }
  },
  head: ({ loaderData }) =>
    seo({
      title: loaderData?.category.name ?? 'The Patisserie',
      description: 'TODO',
      path: `/patisserie/${loaderData?.category.slug ?? ''}`,
    }),
  component: Page,
})

function Page() {
  const { category } = Route.useLoaderData()
  return <div className="wrap py-20">TODO: {category.name}</div>
}
