import { Link, createFileRoute } from '@tanstack/react-router'
import { Reveal } from '#/components/Reveal'
import { ButtonLink, Eyebrow, Ornament } from '#/components/ui'
import { catalogue } from '#/data/catalogue'
import { shopCategory } from '#/data/shopLinks'
import { site } from '#/data/site'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: 'Corica Pastries',
      description:
        "Corica Pastries has been baking continental cakes and pastries in Northbridge since 1957 — home of Perth's most famous apple strudel. Order online for pickup, visit the shop at 106 Aberdeen Street or call (08) 9328 8196.",
      path: '/',
    }),
  component: Page,
})

function Page() {
  return (
    <>
      <Hero />
      <Intro />
      <Ranges />
      <Story />
      <Visit />
    </>
  )
}

/* ------------------------------------------------------------------ hero */

/**
 * Deep green band with the headline stacked on the left and the large strudel
 * cutout filling the right, echoing the current coricapastries.com.au hero.
 * The cutout is a transparent PNG, so a soft radial ellipse sits behind its
 * base to ground it on the green.
 */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-green text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            'url(/img/logo-watermark.png) no-repeat right -120px center / 620px',
        }}
        aria-hidden="true"
      />

      <div className="wrap relative">
        <div
          className="relative my-8 grid items-center gap-8 border border-gold/55 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-8 lg:px-12 lg:py-16 xl:gap-10 xl:px-14"
          style={{
            outline: '1px solid rgb(201 166 64 / 0.55)',
            outlineOffset: '6px',
          }}
        >
          {/* Corner brackets, as in the heritage concept. */}
          <span
            className="pointer-events-none absolute -top-3 -left-3 h-[22px] w-[22px] border-t border-l border-gold"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-3 -bottom-3 h-[22px] w-[22px] border-r border-b border-gold"
            aria-hidden="true"
          />

          <div className="text-center lg:text-left">
            <Eyebrow className="text-[0.7rem] tracking-[0.26em] sm:text-[0.78rem] sm:tracking-eyebrow">
              Northbridge, Perth &nbsp;&middot;&nbsp;{' '}
              <span className="whitespace-nowrap">Est. 1957</span>
            </Eyebrow>

            <h1 className="mt-4 mb-5 text-[clamp(2.3rem,5.4vw,3.9rem)] font-normal text-cream">
              Home of Perth's most famous{' '}
              <em className="whitespace-nowrap text-gold-soft italic">
                apple strudel
              </em>
            </h1>

            <p className="mx-auto max-w-[34ch] text-[1.15rem] italic text-cream/85 sm:text-[1.25rem] lg:mx-0">
              Continental cakes and pastries, made by hand to recipes we have
              perfected for nearly seventy years.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
              <ButtonLink to="/shop" variant="gold">
                Order online
              </ButtonLink>
              <ButtonLink to="/patisserie" variant="cream">
                View the Patisserie
              </ButtonLink>
            </div>

            <p className="mt-4 text-[0.95rem] text-cream/75">
              {`Online orders are collected from the shop at ${site.address.street}, ${site.address.suburb}.`}
            </p>
          </div>

          <div className="relative lg:-mr-4 xl:-mr-8">
            {/* Soft ellipse so the cutout reads as sitting on a surface. */}
            <div
              className="pointer-events-none absolute inset-x-0 -bottom-[12%] h-[26%]"
              style={{
                // closest-side keeps the ellipse inside its box, so it fades to
                // nothing before the edges instead of being clipped.
                background:
                  'radial-gradient(ellipse closest-side at 50% 50%, rgb(0 22 17 / 0.7) 0%, rgb(0 22 17 / 0.42) 40%, rgb(0 22 17 / 0.14) 70%, rgb(0 22 17 / 0) 100%)',
              }}
              aria-hidden="true"
            />
            <img
              src="/img/strudel-hero.png"
              width={1089}
              height={741}
              alt="A Corica apple strudel with a slice cut away, showing layers of flaky pastry, apple, custard and fresh cream"
              className="relative w-full"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

            {/* "Since 1957" seal, kept from the heritage concept. */}
            <div className="absolute right-0 bottom-0 grid h-[86px] w-[86px] -rotate-[8deg] place-items-center rounded-full border-2 border-cream bg-red text-center leading-none text-cream shadow-[0_12px_24px_rgb(0_0_0_/_0.25)] sm:h-[112px] sm:w-[112px]">
              <div>
                <span className="block text-[0.55rem] tracking-[0.2em] uppercase sm:text-[0.6rem]">
                  Since
                </span>
                <b className="font-display text-[1.5rem] font-medium sm:text-[2rem]">
                  1957
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- intro */

function Intro() {
  return (
    <Reveal as="section" className="pt-20 pb-14 text-center md:pt-22">
      <div className="wrap">
        <Eyebrow green>Welcome to Corica Pastries</Eyebrow>
        <h2 className="mx-auto mt-2 mb-4 max-w-[24ch] text-[clamp(2rem,4vw,3.2rem)]">
          A taste of continental Europe, baked fresh in Northbridge every
          morning.
        </h2>
        <Ornament />
        <p className="mx-auto max-w-[58ch] text-[1.2rem] text-pretty text-ink-soft">
          Whether you pick up a Corica product from one of our retail partners
          or visit our very own cake shop on Aberdeen Street, you'll never be
          disappointed.
        </p>
      </div>
    </Reveal>
  )
}

/* ---------------------------------------------------------------- ranges */

const ranges = [
  {
    name: 'Strudels',
    category: 'strudels',
    image: '/img/products/apple-strudel.jpg',
    alt: 'A Corica apple strudel, its flaky pastry layered with apple, custard and cream',
    copy: "You haven't experienced the true delight of strudel until you've tried our delicious, world-famous apple strudel.",
  },
  {
    name: 'Cakes',
    category: 'birthday-cakes',
    image: '/img/products/hazelnut-torta.jpg',
    alt: 'A hazelnut torta finished with piped cream, hazelnuts and chocolate shards',
    copy: 'From the Hazelnut Torta to our continental and custom-made celebration cakes, classic European recipes made fresh daily.',
  },
  {
    name: 'Mini Patisseries',
    category: 'mini-range',
    image: '/img/products/mini-sicilian-cannoli.jpg',
    alt: 'Two mini Sicilian cannoli filled with custard and chocolate cream',
    copy: 'Recipes perfected since 1957, offered as unique strudels, cakes and pastries in bite-sized form.',
  },
] as const

function Ranges() {
  return (
    <section className="pt-4 pb-22" id="ranges">
      <div className="wrap">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {ranges.map((range, i) => (
            <Reveal
              as="article"
              key={range.category}
              delay={i * 0.12}
              className="group flex flex-col items-center text-center last:sm:col-span-2 last:sm:justify-self-center last:lg:col-span-1"
            >
              <Link
                to="/patisserie/$category"
                params={{ category: range.category }}
                className="mx-auto mb-6 block w-full max-w-[300px] rounded-full border border-gold-soft bg-white p-2.5"
              >
                <div className="aspect-square overflow-hidden rounded-full">
                  <img
                    src={range.image}
                    width={800}
                    height={800}
                    alt={range.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full scale-[1.06] object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.12]"
                  />
                </div>
              </Link>

              <h3 className="mb-1.5 text-[1.9rem]">{range.name}</h3>
              <p className="mx-auto mb-4 max-w-[34ch] flex-1 text-pretty text-ink-soft">
                {range.copy}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <Link
                  to="/patisserie/$category"
                  params={{ category: range.category }}
                  className="border-b border-gold text-[0.78rem] tracking-[0.24em] text-green uppercase"
                >
                  Discover<span className="sr-only"> {range.name}</span>
                </Link>
                <span className="text-gold" aria-hidden="true">
                  &#10022;
                </span>
                <Link
                  to="/shop"
                  search={{ category: shopCategory(range.category) }}
                  className="border-b border-gold text-[0.78rem] tracking-[0.24em] text-green uppercase"
                >
                  Order online
                  <span className="sr-only"> ({range.name})</span>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Every range one click away. */}
        <Reveal className="mt-14" delay={0.1}>
          <h2 className="eyebrow eyebrow-green text-center">
            Browse every range
          </h2>
          <ul className="mx-auto mt-4 flex max-w-[52rem] flex-wrap items-center justify-center gap-x-4 gap-y-2.5 text-center">
            {catalogue.map((category, i) => (
              <li key={category.slug} className="flex items-center gap-x-4">
                {i > 0 ? (
                  <span className="text-gold" aria-hidden="true">
                    &#10022;
                  </span>
                ) : null}
                <Link
                  to="/patisserie/$category"
                  params={{ category: category.slug }}
                  className="link-gold"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          as="p"
          className="mt-12 text-center font-display text-[1.4rem] text-ink-soft italic"
        >
          Have a special request?{' '}
          <Link
            to="/contact"
            className="border-b border-red text-red not-italic"
          >
            Contact us.
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- story */

function Story() {
  return (
    <section
      className="border-y border-gold-soft bg-ivory py-20 md:py-24"
      id="story"
    >
      <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <img
            src="/img/shop-staff.jpg"
            width={780}
            height={1024}
            alt="A Corica team member restocking the shelves of the Northbridge shop"
            loading="lazy"
            decoding="async"
            className="aspect-4/5 w-full object-cover"
          />
          <div
            className="pointer-events-none absolute -inset-2.5 border border-gold md:-inset-4"
            aria-hidden="true"
          />
          <div className="absolute -top-6 left-0 bg-green px-5 pt-4 pb-3 font-display text-[2.6rem] leading-none text-cream shadow-[0_14px_30px_rgb(0_0_0_/_0.18)] xl:-top-7 xl:-left-7">
            <span className="block text-[0.62rem] tracking-[0.3em] text-gold uppercase font-body mb-1.5">
              Established
            </span>
            1957
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <Eyebrow green>Our story</Eyebrow>
          <h2 className="mt-2 mb-5 text-[clamp(2rem,3.8vw,3rem)]">
            Perfected since 1957.
          </h2>
          <p className="mb-4 text-[1.15rem] text-ink-soft">
            Established in 1957, Corica Pastries has consistently delighted
            customers with our world-famous apple strudels, continental and
            custom-made cakes, and a choice of unique pastries.
          </p>
          <blockquote className="my-6 border-l-2 border-gold pl-5 font-display text-[1.5rem] text-green italic">
            One bite of our perfectly light pastry, fruity filling and silky
            cream and you'll agree: it's heaven on a plate.
          </blockquote>
          <p className="mb-4 text-[1.15rem] text-ink-soft">
            Corica Pastries has served countless strudels to customers from all
            corners of the globe at our Northbridge cake shop, and we bake them
            the same way today.
          </p>
          <ButtonLink to="/about" className="mt-4">
            Read our story
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- visit */

function Visit() {
  return (
    <section className="py-20 md:py-24" id="visit">
      <div className="wrap grid gap-8 text-center md:grid-cols-3">
        <Reveal className="frame-card px-6 py-10 sm:px-8">
          <Eyebrow>Visit</Eyebrow>
          <h2 className="mt-2 mb-4 text-[1.6rem]">The Patisserie</h2>
          <p className="text-ink-soft">
            {site.address.street}
            <br />
            {site.address.suburb} {site.address.state} {site.address.postcode}
          </p>
          <p className="mt-4">
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

        <Reveal className="frame-card px-6 py-10 sm:px-8" delay={0.12}>
          <Eyebrow>Trading Hours</Eyebrow>
          <h2 className="mt-2 mb-4 text-[1.6rem]">When we're open</h2>
          <dl className="grid grid-cols-[auto_auto] justify-center gap-x-4 gap-y-1 lg:gap-x-5 text-left text-ink-soft">
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

        <Reveal className="frame-card px-6 py-10 sm:px-8" delay={0.24}>
          <Eyebrow>Orders &amp; Enquiries</Eyebrow>
          <h2 className="mt-2 mb-4 text-[1.6rem]">Call the shop</h2>
          <p className="font-display text-[1.9rem] text-green">
            <a href={site.phone.href}>{site.phone.display}</a>
          </p>
          <p className="mt-2 text-ink-soft">
            Custom cakes, special occasions and gluten free range by
            arrangement.
          </p>
          <p className="mt-4">
            <Link to="/shop" className="link-gold">
              Order online for pickup
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/contact" className="link-gold">
              Send an enquiry
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
