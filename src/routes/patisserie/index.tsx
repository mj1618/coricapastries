import { Link, createFileRoute } from '@tanstack/react-router'
import { Reveal } from '#/components/Reveal'
import { PriceNote } from '#/components/patisserie/OrderCard'
import { ButtonLink, Eyebrow, Ornament, PageHero } from '#/components/ui'
import { catalogue, getCategoryMeta } from '#/data/catalogue'
import { shopCategory } from '#/data/shopLinks'
import { site } from '#/data/site'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/patisserie/')({
  head: () =>
    seo({
      title: 'The Patisserie',
      description:
        'Every range Corica Pastries bakes in Northbridge: apple strudels, birthday tortas, cheesecakes and croquembouche, the mini range, small pastries, Italian biscuits, a gluten free range and Christmas. Order online for pickup, by phone or in store.',
      path: '/patisserie',
    }),
  component: Page,
})

function Page() {
  return (
    <>
      <PageHero
        eyebrow="The Patisserie"
        title="Strudels, cakes and pastries, made the way we have since 1957."
        lede="Everything is baked here in Northbridge. Browse the ranges below, then order online for pickup, by phone or in the shop."
      />
      <Ranges />
      <HowToOrder />
    </>
  )
}

/* ---------------------------------------------------------------- ranges */

function Ranges() {
  return (
    <section className="pt-16 pb-20 md:pt-20 md:pb-24">
      <div className="wrap">
        <Reveal className="text-center">
          <Eyebrow green>Eight ranges</Eyebrow>
          <h2 className="mx-auto mt-2 max-w-[22ch] text-[clamp(1.9rem,3.6vw,2.8rem)]">
            Choose a range to see everything in it
          </h2>
          <Ornament />
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {catalogue.map((category, i) => {
            const meta = getCategoryMeta(category.slug)
            return (
              <Reveal
                as="article"
                key={category.slug}
                delay={(i % 4) * 0.08}
                className="h-full"
              >
                <div className="flex h-full flex-col items-center text-center">
                  <Link
                    to="/patisserie/$category"
                    params={{ category: category.slug }}
                    className="group block w-full"
                  >
                    <div className="relative mx-auto aspect-square w-full max-w-[190px] overflow-hidden rounded-full border border-gold-soft bg-white p-2.5 sm:max-w-[240px]">
                      <img
                        src={meta.image}
                        alt={meta.imageAlt}
                        width={800}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <h3 className="mt-5 text-[1.65rem] text-balance transition-colors group-hover:text-red">
                      {category.name}
                    </h3>
                  </Link>

                  <p className="mt-2 max-w-[32ch] flex-1 text-[0.98rem] text-pretty text-ink-soft">
                    {meta.blurb}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    <Link
                      to="/patisserie/$category"
                      params={{ category: category.slug }}
                      className="border-b border-gold pb-0.5 text-[0.75rem] tracking-nav text-green uppercase transition-colors hover:text-red"
                    >
                      Discover
                      <span className="sr-only"> {category.name}</span>
                    </Link>
                    <span className="text-gold" aria-hidden="true">
                      &#10022;
                    </span>
                    <Link
                      to="/shop"
                      search={{ category: shopCategory(category.slug) }}
                      className="border-b border-gold pb-0.5 text-[0.75rem] tracking-nav text-green uppercase transition-colors hover:text-red"
                    >
                      Order online
                      <span className="sr-only"> ({category.name})</span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <PriceNote className="mt-14" />
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- how to order */

const steps = [
  {
    n: 'I',
    title: 'Choose from the ranges',
    body: 'Browse the eight ranges above for sizes, fillings and prices. Can’t see what you have in mind? We can talk it through.',
  },
  {
    n: 'II',
    title: 'Order online, or call us',
    body: `Add what you would like to the cart in our online shop and choose a pickup day, or ring ${site.phone.display} and one of our team will take your order at the counter.`,
  },
  {
    n: 'III',
    title: 'Collect from Aberdeen Street',
    body: `Pick up your order from the shop at ${site.address.street}, ${site.address.suburb}.`,
  },
]

const goodToKnow = [
  'Online orders are for pickup — you choose a pickup day at checkout and collect from the shop.',
  'Some products need 48–72 hours’ notice, so the more notice you can give us the better.',
  'We can write a custom message on your cake — please ask when you order.',
  'Wholesale is available by arrangement. Call the shop to discuss.',
  'We do not offer home delivery, but you can find us on UberEats and DoorDash.',
]

function HowToOrder() {
  return (
    <section className="relative overflow-hidden bg-green text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            'url(/img/logo-watermark.png) no-repeat left -140px center / 560px',
        }}
        aria-hidden="true"
      />

      <div className="wrap relative py-16 md:py-20">
        <Reveal className="text-center">
          <Eyebrow>How to order</Eyebrow>
          <h2 className="mx-auto mt-2 max-w-[24ch] text-[clamp(1.9rem,3.6vw,2.8rem)] text-cream">
            Order online, by phone or in person
          </h2>
          <Ornament />
        </Reveal>

        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.n}
              delay={i * 0.1}
              className="text-center md:text-left"
            >
              <span
                aria-hidden="true"
                className="font-display text-[1.5rem] text-gold-soft"
              >
                {step.n}
              </span>
              <h3 className="mt-1 text-[1.5rem] text-cream">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[38ch] text-[1rem] text-pretty text-cream/85 md:mx-0">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14">
          <div className="mx-auto max-w-[62ch] border border-gold/45 px-6 py-7 sm:px-9">
            <h3 className="text-center text-[0.75rem] tracking-eyebrow text-gold uppercase">
              Good to know
            </h3>
            <ul className="mt-4 space-y-2.5 text-[1rem] text-cream/85">
              {goodToKnow.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-gold-soft">
                    &#10022;
                  </span>
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/shop" variant="gold">
              Order online
            </ButtonLink>
            <a href={site.phone.href} className="btn btn-cream">
              Call {site.phone.display}
            </a>
            <ButtonLink to="/contact" variant="cream">
              Contact us
            </ButtonLink>
          </div>

          <p className="mt-8 text-center text-[0.9rem] text-cream/75 italic">
            Prices shown here are a guide; the online shop always shows current
            prices.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
