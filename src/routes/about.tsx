import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/about')({
  head: () => seo({ title: 'about', description: 'TODO', path: '/about' }),
  component: Page,
})

function Page() {
  return <div className="wrap py-20">TODO: about</div>
}
