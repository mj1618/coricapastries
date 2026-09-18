import { Link } from '@tanstack/react-router'
import { catalogue } from '#/data/catalogue'

/**
 * Horizontal row of all eight ranges, shown directly under the hero on a
 * category page so visitors can hop between ranges without going back.
 * Wraps and centres from md up; scrolls sideways on a phone.
 */
export function CategoryNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Ranges"
      className="border-b border-gold-soft bg-ivory"
      id="ranges"
    >
      <div className="wrap">
        <ul className="-mx-4 flex gap-x-6 gap-y-1 overflow-x-auto px-4 py-4 whitespace-nowrap md:mx-0 md:flex-wrap md:justify-center md:gap-x-8 md:overflow-visible md:px-0">
          {catalogue.map((category) => {
            const active = category.slug === current
            return (
              <li key={category.slug} className="shrink-0">
                <Link
                  to="/patisserie/$category"
                  params={{ category: category.slug }}
                  aria-current={active ? 'page' : undefined}
                  className={`block border-b-2 py-1.5 text-[0.78rem] tracking-nav uppercase transition-colors ${
                    active
                      ? 'border-gold text-green'
                      : 'border-transparent text-ink-soft hover:border-gold-soft hover:text-green'
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
