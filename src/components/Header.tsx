import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { nav, site } from '#/data/site'
import { CartNotification } from '#/components/shop/CartNotification'
import { useCart } from '#/lib/shop/cart'

const left = nav.slice(0, 3)
const right = nav.slice(3)

const desktopLink =
  'relative py-1.5 text-[0.8rem] uppercase tracking-nav text-green ' +
  "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gold after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:content-[''] " +
  'hover:after:scale-x-100 [&.active]:after:scale-x-100'

const mobileLink =
  'block border-b border-gold-soft px-6 py-4 text-[0.9rem] uppercase tracking-[0.2em] text-green'

export function Header() {
  const [open, setOpen] = useState(false)
  const cart = useCart()
  const count = cart.hydrated ? cart.count : 0

  const desktopItem = (item: (typeof nav)[number]) =>
    'href' in item ? (
      <a key={item.href} href={item.href} className={desktopLink}>
        {item.label}
      </a>
    ) : (
      <Link
        key={item.to}
        to={item.to}
        className={desktopLink}
        activeOptions={{ exact: item.to === '/' }}
      >
        {item.label}
      </Link>
    )

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
        {site.openDays}
        <span className="hidden sm:inline">
          &nbsp;<span className="text-gold">&#10022;</span>&nbsp;{' '}
          {site.address.street}, {site.address.suburb}
        </span>
        &nbsp;<span className="text-gold">&#10022;</span>&nbsp;
        <a
          href={site.phone.href}
          className="whitespace-nowrap hover:text-gold-soft"
        >
          {site.phone.display}
        </a>
      </div>

      <header className="sticky top-0 z-50 border-b border-gold-soft bg-cream">
        <div className="wrap grid min-h-20 grid-cols-[auto_1fr_auto] items-center gap-4 md:min-h-24 md:grid-cols-[1fr_auto_1fr] md:gap-6 lg:gap-8 xl:gap-11">
          <nav
            className="hidden justify-end gap-5 md:flex lg:gap-6 xl:gap-9"
            aria-label="Primary"
          >
            {left.map(desktopItem)}
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

          <div className="col-start-3 flex items-center justify-end gap-3 md:justify-between lg:gap-3">
            <nav
              className="hidden justify-start gap-5 md:flex lg:gap-6 xl:gap-9"
              aria-label="Secondary"
            >
              {right.map(desktopItem)}
            </nav>

            <Link
              to="/shop/cart"
              className="relative -m-1.5 p-2 text-green hover:text-red"
              aria-label={
                count > 0
                  ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
                  : 'Cart'
              }
              onClick={() => setOpen(false)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              >
                <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
                <path d="M9 10V6.5a3 3 0 0 1 6 0V10" strokeLinecap="round" />
              </svg>
              {count > 0 ? (
                <span className="absolute top-0 -right-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-green px-1 text-[0.62rem] leading-none text-cream">
                  {count}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              className="border border-green px-3.5 py-2 text-[0.72rem] uppercase tracking-[0.2em] text-green md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        <CartNotification />

        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={`${open ? 'block' : 'hidden'} border-t border-gold-soft bg-cream md:hidden`}
        >
          {nav.map((item) =>
            'href' in item ? (
              <a key={item.href} href={item.href} className={mobileLink}>
                {item.label}
              </a>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`${mobileLink} [&.active]:bg-ivory`}
                activeOptions={{ exact: item.to === '/' }}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </header>
    </>
  )
}
