import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/faqs')({
  head: () => seo({ title: 'faqs', description: 'TODO', path: '/faqs' }),
  component: Page,
})

function Page() {
  return <div className="wrap py-20">TODO: faqs</div>
}
