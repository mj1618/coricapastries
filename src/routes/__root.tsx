import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Header } from '#/components/Header'
import { Footer } from '#/components/Footer'
import { ButtonLink } from '#/components/ui'
import { analyticsHostPattern, gtmId, site } from '#/data/site'
import { businessGraph, jsonLd } from '#/lib/seo'
import { CartProvider } from '#/lib/shop/cart'
import appCss from '../styles.css?url'

const fontsHref =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap'

const gtmSnippet = `if (${analyticsHostPattern.toString()}.test(location.hostname)) {
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#004d3f' },
      // Search Console ownership, carried over from the old site so it survives the cutover.
      {
        name: 'google-site-verification',
        content: 'zwFsO4GIVMuWRyeYKduMkJbpsXRXX4N3fKZvPe1ZgBQ',
      },
      { title: `${site.name} | ${site.tagline} — Since ${site.established}` },
    ],
    links: [
      { rel: 'stylesheet', href: fontsHref },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      {
        rel: 'icon',
        href: '/img/icon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      { rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
    scripts: [
      // Marks that JS is running so .reveal animations can hide content before fading in.
      { children: "document.documentElement.classList.add('js')" },
      // Google Tag Manager, guarded by hostname so dev and staging never send hits.
      // No <noscript> iframe: it cannot be guarded the same way, and GA4's own
      // history-change tracking covers client-side navigation once gtm.js runs.
      { children: gtmSnippet },
      // The shop as a schema.org Bakery, on every page.
      jsonLd(businessGraph()),
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* First in the head so the connections open before the font stylesheet is parsed. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <CartProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-cream focus:px-4 focus:py-2 focus:text-green"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </CartProvider>
  )
}

function NotFound() {
  return (
    <section className="wrap py-24 text-center md:py-32">
      <div className="eyebrow">Page not found</div>
      <h1 className="mx-auto mt-3 max-w-[20ch] text-[clamp(2.2rem,4.5vw,3.4rem)]">
        We couldn't find that page.
      </h1>
      <p className="mx-auto mt-4 max-w-[48ch] text-ink-soft">
        The link may be out of date. Everything we bake is listed in the
        patisserie, you can order online for pickup in our shop, and the team is
        always happy to help by phone.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <ButtonLink to="/" variant="solid">
          Back to home
        </ButtonLink>
        <ButtonLink to="/shop">Order online</ButtonLink>
        <ButtonLink to="/patisserie">View the Patisserie</ButtonLink>
      </div>
      <p className="mt-8 text-ink-soft">
        Or call us on{' '}
        <a href={site.phone.href} className="link-gold">
          {site.phone.display}
        </a>
        . Looking for something else?{' '}
        <Link to="/contact" className="link-gold">
          Contact us
        </Link>
        .
      </p>
    </section>
  )
}
