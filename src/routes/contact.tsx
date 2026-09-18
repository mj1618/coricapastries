import { Link, createFileRoute } from '@tanstack/react-router'
import { ContactForm } from '#/components/contact/ContactForm'
import { Reveal } from '#/components/Reveal'
import { Eyebrow, Ornament, PageHero } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/contact')({
  head: () =>
    seo({
      title: 'Contact Us',
      description: `Visit Corica Pastries at ${fullAddress}, or call the shop on ${site.phone.display}. Trading hours, directions, parking and an enquiry form for orders, custom cakes and wholesale.`,
      path: '/contact',
    }),
  component: Page,
})

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Come and say hello."
        lede={
          <>
            For time-sensitive enquiries please call the shop on{' '}
            <a
              href={site.phone.href}
              className="whitespace-nowrap border-b border-gold text-cream not-italic transition-colors hover:text-gold-soft"
            >
              {site.phone.display}
            </a>
            ; otherwise send us a note and we will get back to you as soon as we
            can. Grazie!
          </>
        }
      />

      <Details />
      <EnquirySection />
      <QuietFooter />
    </>
  )
}

/* --------------------------------------------------------------- details */

/** The three framed cards from the heritage concept: where, how, and when. */
function Details() {
  return (
    <section className="py-16 md:py-20">
      <div className="wrap grid gap-8 text-center md:grid-cols-3">
        <Reveal className="frame-card px-7 py-10 sm:px-8">
          <Eyebrow>Visit</Eyebrow>
          <h2 className="mt-2 mb-4 text-[1.6rem]">The Patisserie</h2>
          <p className="text-ink-soft">
            {site.address.street}
            <br />
            {site.address.suburb} {site.address.state} {site.address.postcode}
          </p>
          <p className="mx-auto mt-3 max-w-[26ch] text-[1rem] text-ink-soft">
            Look for the bright green building. {site.address.landmark}.
          </p>
          <p className="mt-5">
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-gold"
            >
              Get directions
            </a>
          </p>
        </Reveal>

        <Reveal className="frame-card px-7 py-10 sm:px-8" delay={0.12}>
          <Eyebrow>Call us</Eyebrow>
          <h2 className="mt-2 mb-4 text-[1.6rem]">Speak to the shop</h2>
          <p className="font-display text-[clamp(1.6rem,4.5vw,1.9rem)] text-green">
            <a href={site.phone.href} className="hover:text-red">
              {site.phone.display}
            </a>
          </p>
          <p className="mx-auto mt-3 max-w-[26ch] text-ink-soft">
            Orders, custom cakes and wholesale enquiries.
          </p>
          <p className="mt-4 text-[0.95rem] text-ink-soft">
            Prefer to order online?{' '}
            <Link to="/shop" className="link-gold">
              Visit the shop
            </Link>
          </p>
        </Reveal>

        <Reveal className="frame-card px-7 py-10 sm:px-8" delay={0.24}>
          <Eyebrow>Trading hours</Eyebrow>
          <h2 className="mt-2 mb-4 text-[1.6rem]">When we're open</h2>
          <dl className="grid grid-cols-[auto_auto] justify-center gap-x-5 gap-y-1 text-left text-ink-soft">
            {site.hours.map((row) => (
              <div key={row.days} className="contents">
                <dt className="font-medium text-ink">{row.days}</dt>
                <dd>{row.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[0.95rem] text-ink-soft italic">
            {site.hoursNote}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- form */

/** Form on the left, map on the right; they stack on anything below lg. */
function EnquirySection() {
  return (
    <section className="border-t border-gold-soft/70 bg-cream-deep/40 py-16 md:py-20">
      <div className="wrap">
        <div className="text-center">
          <Eyebrow green>Send a note</Eyebrow>
          <h2 className="mt-2 text-[clamp(2rem,4vw,2.8rem)]">
            Enquiries &amp; orders
          </h2>
          <Ornament />
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="border border-gold-soft bg-ivory p-2">
              <div className="aspect-[4/3] w-full">
                <iframe
                  src={site.mapsEmbedUrl}
                  title={`Map showing ${site.name}, ${site.address.street} ${site.address.suburb}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </div>
            <p className="mt-4 text-[1rem] text-ink-soft">
              <span className="font-medium text-ink">Parking:</span> 5-minute
              bays alongside the shop on Lake Street, paid parking across the
              street and on Aberdeen Street.
            </p>
            <p className="mt-3">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-gold"
              >
                Open in Google Maps
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- quiet footer */

function QuietFooter() {
  return (
    <section className="border-t border-gold-soft/70 py-10">
      <div className="wrap flex flex-col items-center justify-between gap-5 text-center text-[1rem] text-ink-soft sm:flex-row sm:text-left">
        <p>
          Find us on{' '}
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="link-gold"
          >
            Facebook
          </a>{' '}
          and{' '}
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-gold"
          >
            Instagram
          </a>
          .
        </p>
        <p>
          Questions about the strudel, ordering or allergens?{' '}
          <Link to="/faqs" className="link-gold">
            See our FAQs
          </Link>
        </p>
      </div>
    </section>
  )
}
