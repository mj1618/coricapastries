import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { nav, site } from '#/data/site'

const left = nav.slice(0, 3)
const right = nav.slice(3)

const desktopLink =
  'relative py-1.5 text-[0.8rem] uppercase tracking-nav text-green ' +
  "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gold after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:content-[''] " +
  'hover:after:scale-x-100 [&.active]:after:scale-x-100'

export function Header() {
  const [open, setOpen] = useState(false)

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className="bg-green-deep px-4 py-2 text-center text-[0.72rem] uppercase tracking-[0.12em] text-cream sm:text-[0.82rem] sm:tracking-[0.14em]">
        Open Monday to Saturday
        <span className="hidden sm:inline">
          &nbsp;<span className="text-gold">&#10022;</span>&nbsp; {site.address.street},{' '}
          {site.address.suburb}
        </span>
        &nbsp;<span className="text-gold">&#10022;</span>&nbsp;
        <a href={site.phone.href} className="whitespace-nowrap hover:text-gold-soft">
          {site.phone.display}
        </a>
      </div>

      <header className="sticky top-0 z-50 border-b border-gold-soft bg-cream">
        <div className="wrap grid min-h-20 grid-cols-[auto_1fr_auto] items-center gap-4 md:min-h-24 md:grid-cols-[1fr_auto_1fr] md:gap-11">
          <nav
            className="hidden justify-end gap-9 md:flex"
            aria-label="Primary"
          >
            {left.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={desktopLink}
                activeOptions={{ exact: item.to === '/' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/"
            className="col-start-1 md:col-start-2"
            aria-label={`${site.name} home`}
            onClick={() => setOpen(false)}
          >
            <img
              src="/img/logo-large.png"
              alt={`${site.name} — ${site.founder}, ${site.established}`}
              width={255}
              height={221}
              className="h-[60px] w-auto md:mx-auto md:h-[72px]"
            />
          </Link>

          <nav
            className="hidden justify-start gap-9 md:flex"
            aria-label="Secondary"
          >
            {right.map((item) => (
              <Link key={item.to} to={item.to} className={desktopLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="col-start-3 justify-self-end border border-green px-3.5 py-2 text-[0.72rem] uppercase tracking-[0.2em] text-green md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={`${open ? 'block' : 'hidden'} border-t border-gold-soft bg-cream md:hidden`}
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block border-b border-gold-soft px-6 py-4 text-[0.9rem] uppercase tracking-[0.2em] text-green [&.active]:bg-ivory"
              activeOptions={{ exact: item.to === '/' }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}
