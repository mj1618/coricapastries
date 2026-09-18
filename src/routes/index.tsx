import { createFileRoute } from '@tanstack/react-router'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/')({
  head: () => seo({ title: 'index', description: 'TODO', path: '/' }),
  component: Page,
})

function Page() {
  return <div className="wrap py-20">TODO: index</div>
}
