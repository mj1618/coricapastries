import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Reveal } from '#/components/Reveal'
import { ButtonLink, Eyebrow, Ornament, PageHero } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/about')({
  head: () =>
    seo({
      title: 'About Us | Corica Pastries, Northbridge since 1957',
      description:
        'Established in 1957 by Giuseppe Corica, Corica Pastries has baked apple strudel, continental cakes and pastries in Northbridge, Perth for nearly seventy years.',
      path: '/about',
    }),
  component: Page,
})

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Perfected since 1957."
        lede="Nearly seventy years of apple strudels, continental cakes and pastries, baked in the heart of Northbridge."
      />
      <Story />
      <Values />
      <WhereToFind />
      <PhotoBand />
      <ClosingCta />
    </>
  )
}

/* ---------------------------------------------------------------- story ---- */

function Story() {
  return (
    <section className="border-b border-gold-soft bg-ivory py-20 md:py-24">
      <div className="wrap grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[420px] md:max-w-none">
          <img
            src="/img/shop-staff.jpg"
            alt="A Corica Pastries team member stocking the shelves of the Northbridge shop with pastries and biscuits"
            width={780}
            height={1024}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <div
            className="pointer-events-none absolute -inset-2.5 border border-gold sm:-inset-4"
            aria-hidden="true"
          />
          <p className="absolute -top-6 left-0 bg-green px-5 py-4 font-display text-[2.2rem] leading-none text-cream shadow-[0_14px_30px_rgba(0,0,0,0.18)] sm:-top-7 sm:-left-7 sm:text-[2.6rem]">
            <span className="mb-1.5 block font-body text-[0.62rem] tracking-[0.3em] text-gold uppercase">
              Established
            </span>
            {site.established}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <Eyebrow green>Since {site.established}</Eyebrow>
          <h2 className="mt-3 text-[clamp(2rem,3.8vw,3rem)]">
            A Northbridge patisserie,
            <br />
            nearly seventy years on.
          </h2>
          <p className="mt-6 text-[1.15rem] text-ink-soft">
            Established in {site.established} by {site.founder}, Corica Pastries
            has consistently delighted customers with our world-famous apple
            strudels, continental and custom-made cakes, and a choice of unique
            pastries.
          </p>
          <blockquote className="my-7 border-l-2 border-gold pl-5 font-display text-[1.5rem] leading-snug text-green italic">
            You only need to take one bite of our perfectly light pastry, along
            with the fruity and creamy filling, to agree it&rsquo;s like heaven
            on a plate.
          </blockquote>
          <p className="text-[1.15rem] text-ink-soft">
            Our cake shop is in the heart of Northbridge, and from it we have
            served up countless strudels to customers from all corners of the
            globe. We still use recipes perfected since {site.established}, and
            we refuse to compromise on the quality and freshness of our
            ingredients, so all our customers can be sure of the most
            pleasurable eating experience time and again.
          </p>
          <p className="mt-4 text-[1.15rem] text-ink-soft">
            Today we are also trusted to supply our cakes and pastries to IGA
            supermarkets and coffee shops throughout Australia &mdash; though
            the best place to meet them is still the bright green building on
            the corner of Aberdeen Street and Lake Street.
          </p>
          <ButtonLink to="/patisserie" className="mt-8">
            View the Patisserie
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- values ---- */

const values: Array<{ eyebrow: string; title: string; body: ReactNode }> = [
  {
    eyebrow: 'Ingredients',
    title: 'Quality and freshness',
    body: (
      <>
        We refuse to compromise on the quality and freshness of our ingredients.
        Our dairy is pasteurised and purchased fresh daily, so every customer
        can be sure of the same eating experience time and again.
      </>
    ),
  },
  {
    eyebrow: 'The craft',
    title: 'Recipes perfected since 1957',
    body: (
      <>
        Our strudels, cakes and pastries follow recipes perfected since 1957.
        Every one of them is made by hand at our Northbridge shop.
      </>
    ),
  },
  {
    eyebrow: 'Our customers',
    title: 'We listen',
    body: (
      <>
        We know what our customers enjoy because we listen to their sweet
        comments and suggestions. Tell us what you would like and we will do our
        best to make it happen.
      </>
    ),
  },
]

function Values() {
  return (
    <section className="py-20 md:py-24">
      <div className="wrap">
        <Reveal className="text-center">
          <Eyebrow>What we stand for</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[20ch] text-[clamp(2rem,4vw,3rem)]">
            Three things that have not changed.
          </h2>
          <Ornament />
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 0.12}>
              <div className="frame-card h-full px-8 py-10 text-center">
                <Eyebrow>{v.eyebrow}</Eyebrow>
                <h3 className="mt-3 mb-4 text-[1.7rem]">{v.title}</h3>
                <p className="text-ink-soft">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* -------------------------------------------------------- where to find ---- */

function WhereToFind() {
  return (
    <section className="border-y border-gold-soft bg-ivory py-20 md:py-24">
      <div className="wrap">
        <Reveal className="text-center">
          <Eyebrow>Where to find us</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[22ch] text-[clamp(2rem,4vw,3rem)]">
            Where to find Corica.
          </h2>
          <Ornament />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Reveal>
            <div className="frame-card h-full px-6 py-9 sm:px-10 sm:py-10">
              <Eyebrow green>The shop</Eyebrow>
              <h3 className="mt-3 mb-4 text-[1.9rem]">The Northbridge shop</h3>
              <p className="text-ink-soft">
                {site.address.street}
                <br />
                {site.address.suburb} {site.address.state}{' '}
                {site.address.postcode}
              </p>
              <p className="mt-3 text-ink-soft italic">
                The bright green building on the corner of Aberdeen Street and
                Lake Street.
              </p>

              <dl className="mt-6 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-t border-gold-soft pt-6 text-ink-soft sm:gap-x-8">
                {site.hours.map((h) => (
                  <div key={h.days} className="contents">
                    <dt className="font-medium text-ink">{h.days}</dt>
                    <dd className="text-right whitespace-nowrap">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[0.98rem] text-ink-soft italic">
                {site.hoursNote}
              </p>

              <p className="mt-6">
                <Link to="/shop" className="link-gold">
                  Order online for pickup
                </Link>
              </p>
              <p className="mt-2">
                <Link to="/contact" className="link-gold">
                  Hours, map and directions
                </Link>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="frame-card h-full px-8 py-10 sm:px-10">
              <Eyebrow green>Further afield</Eyebrow>
              <h3 className="mt-3 mb-4 text-[1.9rem]">Retail partners</h3>
              <p className="text-ink-soft">
                We are trusted to supply our cakes and pastries to IGA
                supermarkets and coffee shops throughout Australia, so you may
                well meet a Corica pastry a long way from Aberdeen Street.
              </p>
              <p className="mt-4 text-ink-soft">
                Wholesale orders are collected from us in Northbridge. If you
                would like to stock our products, call the shop and we will talk
                it through with you.
              </p>
              <p className="mt-6 font-display text-[1.9rem] text-green">
                <a href={site.phone.href} className="hover:text-red">
                  {site.phone.display}
                </a>
              </p>
              <p className="mt-3">
                <Link to="/faqs" hash="wholesale" className="link-gold">
                  Read about wholesale
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- photo band ---- */

function PhotoBand() {
  return (
    <section className="relative isolate overflow-hidden bg-green text-cream">
      <img
        src="/img/shop-counter-wide.jpg"
        alt="The display counter at the Corica Pastries shop in Northbridge, filled with cakes and pastries"
        width={1920}
        height={666}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[85%_center]"
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-r from-green-deep/90 via-green-deep/70 to-transparent"
        aria-hidden="true"
      />
      <div className="wrap py-20 md:py-28">
        <Reveal className="max-w-[640px]">
          <Eyebrow>Northbridge</Eyebrow>
          <blockquote className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight text-cream italic">
            Corica Pastries has served up countless strudels to customers from
            all corners of the globe at our Northbridge cake shop.
          </blockquote>
          <p className="mt-5 text-cream/85">{fullAddress}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- closing cta ---- */

function ClosingCta() {
  return (
    <section className="py-20 text-center md:py-24">
      <div className="wrap">
        <Reveal>
          <Eyebrow>Visit us</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[18ch] text-[clamp(2rem,4.2vw,3.2rem)]">
            Come and taste it for yourself.
          </h2>
          <Ornament />
          <p className="mx-auto mt-2 max-w-[52ch] text-[1.15rem] text-ink-soft">
            Browse the full range, or call the shop and we will help you choose
            something for the occasion.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/patisserie" variant="solid">
              View the Patisserie
            </ButtonLink>
            <a href={site.phone.href} className="btn">
              Call the shop
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
