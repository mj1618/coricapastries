import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/patisserie/')({
  head: () => seo({ title: 'The Patisserie', description: 'TODO', path: '/patisserie' }),
  component: Page,
})

function Page() {
  return <div className="wrap py-20">TODO: patisserie index</div>
}
