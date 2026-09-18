import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/')({
  head: () => seo({ title: 'Shop', description: 'TODO', path: '/shop' }),
  component: Page,
})

function Page() {
  const { store } = shopRoute.useLoaderData()
  return (
    <div className="wrap py-20">
      TODO: shop home ({store.products.length} products)
    </div>
  )
}
