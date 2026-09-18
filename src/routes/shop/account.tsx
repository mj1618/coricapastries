import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/shop/account')({
  head: () =>
    seo({ title: 'Your account', description: 'TODO', path: '/shop/account' }),
  component: Page,
})

function Page() {
  return <div className="wrap py-20">TODO: account</div>
}
