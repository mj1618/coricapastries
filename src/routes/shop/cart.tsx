import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'
import { useCart } from '#/lib/shop/cart'

export const Route = createFileRoute('/shop/cart')({
  head: () =>
    seo({ title: 'Your cart', description: 'TODO', path: '/shop/cart' }),
  component: Page,
})

function Page() {
  const cart = useCart()
  return <div className="wrap py-20">TODO: cart ({cart.count} items)</div>
}
