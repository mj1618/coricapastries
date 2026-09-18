import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/contact')({
  head: () => seo({ title: 'contact', description: 'TODO', path: '/contact' }),
  component: Page,
})

function Page() {
  return <div className="wrap py-20">TODO: contact</div>
}
