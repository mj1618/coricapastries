import { Link, createFileRoute } from '@tanstack/react-router'
import { Reveal } from '#/components/Reveal'
import { ButtonLink, Eyebrow, Ornament, PageHero } from '#/components/ui'
import { shopCategory } from '#/data/shopLinks'
import { site } from '#/data/site'
import { breadcrumbs, jsonLd, productPath, seo } from '#/lib/seo'

/**
 * The story of the apple strudel. The old WordPress site had a blog post at this
 * URL that ranked for "apple strudel perth" style searches; this keeps the URL and
 * the parts of that post the site can stand behind. Copy stays factual: the
 * founding facts come from `site.ts`, the recipe from the catalogue descriptions
 * and the travel notes from the FAQs.
 */
const PATH = '/apple-strudel-history'
const TITLE = "The Story Behind Perth's Famous Apple Strudel"
const DESCRIPTION =
  'First baked in Perth in 1957 by Giuseppe Corica: the story of the Corica apple strudel, how its layers of pastry, custard, apple and cream are put together, and how to order one.'

export const Route = createFileRoute('/apple-strudel-history')({
  head: () => ({
    ...seo({
      title: `${TITLE} | ${site.name}`,
      description: DESCRIPTION,
      path: PATH,
      type: 'article',
      image: {
        path: '/img/products/apple-strudel.jpg',
        width: 800,
        height: 800,
        alt: 'A Corica apple strudel, its flaky puff pastry layered with apple, custard and cream',
      },
    }),
    scripts: [
      jsonLd(
        breadcrumbs([{ name: 'About Us', path: '/about' }, { name: TITLE }]),
      ),
    ],
  }),
  component: Page,
})

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Our apple strudel"
        title="The story of the Corica apple strudel."
        lede={`First baked in Perth in ${site.established}, and made to the same recipe today.`}
      />
      <Origins />
      <Layers />
      <Blueberry />
      <Travel />
      <ClosingCta />
    </>
  )
}

/* -------------------------------------------------------------- origins ---- */

function Origins() {
  return (
    <section className="border-b border-gold-soft bg-ivory py-20 md:py-24">
      <div className="wrap grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[420px] md:max-w-none">
          <img
            src="/img/products/apple-strudel.jpg"
            alt="A Corica apple strudel, its flaky puff pastry layered with apple, custard and cream"
            width={800}
            height={800}
            className="aspect-square w-full object-cover"
          />
          <div
            className="pointer-events-none absolute -inset-2.5 border border-gold sm:-inset-4"
            aria-hidden="true"
          />
          <p className="absolute -top-6 left-0 bg-green px-5 py-4 font-display text-[2.2rem] leading-none text-cream shadow-[0_14px_30px_rgba(0,0,0,0.18)] sm:-top-7 sm:-left-7 sm:text-[2.6rem]">
            <span className="mb-1.5 block font-body text-[0.62rem] tracking-[0.3em] text-gold uppercase">
              Since
            </span>
            {site.established}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <Eyebrow green>Where it began</Eyebrow>
          <h2 className="mt-3 text-[clamp(2rem,3.8vw,3rem)]">
            Introduced to Perth in {site.established}.
          </h2>
          <p className="mt-6 text-[1.15rem] text-ink-soft">
            Our apple strudel was first introduced to Perth in{' '}
            {site.established} by Sicilian patissier {site.founder}. People have
            been coming to us for it ever since, from all over Perth and from
            much further away.
          </p>
          <p className="mt-4 text-[1.15rem] text-ink-soft">
            Many of them are marking an occasion. Christenings, engagements,
            birthdays and weddings have all been celebrated with a Corica
            strudel on the table.
          </p>
          <blockquote className="my-7 border-l-2 border-gold pl-5 font-display text-[1.5rem] leading-snug text-green italic">
            Since {site.established}, our apple strudel has remained true to its
            original recipe.
          </blockquote>
          <p className="text-[1.15rem] text-ink-soft">
            It is still made by hand, fresh every day, at our shop on Aberdeen
            Street in Northbridge.{' '}
            <Link to="/about" className="link-gold">
              More about Corica Pastries
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- layers ---- */

const layers = [
  {
    title: 'Puff pastry',
    body: 'Flaky, buttery puff pastry gives the strudel its crunch, against the soft fillings inside.',
  },
  {
    title: 'Italian custard',
    body: 'Made by hand in our own kitchen and spread over the pastry.',
  },
  {
    title: 'Baked apple',
    body: 'A layer of freshly baked apple goes on top of the custard.',
  },
  {
    title: 'Fresh cream',
    body: 'Whipped cream is piped over the apple in ribbons to finish the layer.',
  },
]

function Layers() {
  return (
    <section className="py-20 md:py-24">
      <div className="wrap">
        <Reveal className="text-center">
          <Eyebrow>The recipe</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[20ch] text-[clamp(2rem,4vw,3rem)]">
            What makes it different.
          </h2>
          <Ornament />
          <p className="mx-auto mt-2 max-w-[62ch] text-[1.15rem] text-ink-soft">
            A traditional apple strudel is baked whole, with custard or cream
            served on the side. Ours follows an Italian recipe: each part is
            prepared on its own, and the custard and cream go inside the pastry.
          </p>
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((layer, i) => (
            <Reveal as="li" key={layer.title} delay={i * 0.1}>
              <div className="frame-card h-full px-7 py-9 text-center">
                <p
                  className="font-display text-[2.4rem] leading-none text-gold"
                  aria-hidden="true"
                >
                  {i + 1}
                </p>
                <h3 className="mt-3 mb-3 text-[1.6rem]">{layer.title}</h3>
                <p className="text-ink-soft">{layer.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <p className="mx-auto mt-10 max-w-[62ch] text-center text-[1.15rem] text-ink-soft">
            Then it is all repeated for a second layer, and the strudel is
            topped with a final sheet of puff pastry.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ blueberry ---- */

function Blueberry() {
  return (
    <section className="border-y border-gold-soft bg-ivory py-20 md:py-24">
      <div className="wrap grid grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-20">
        <Reveal>
          <Eyebrow green>Two flavours, two sizes</Eyebrow>
          <h2 className="mt-3 text-[clamp(2rem,3.8vw,3rem)]">
            Apple, or blueberry and apple.
          </h2>
          <p className="mt-6 text-[1.15rem] text-ink-soft">
            The Blueberry &amp; Apple Strudel is made the same way, with the
            same pastry, custard and cream, and with blueberries alongside the
            apple. It suits anyone who would like to try a variation, or who
            prefers something a little more tart.
          </p>
          <p className="mt-4 text-[1.15rem] text-ink-soft">
            Both come in two sizes: the full strudel, which suits a group, and a
            half size for two.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <Link
              to={productPath('strudels', 'apple-strudel')}
              className="link-gold"
            >
              Apple Strudel
            </Link>
            <Link
              to={productPath('strudels', 'blueberry-apple-strudel')}
              className="link-gold"
            >
              Blueberry &amp; Apple Strudel
            </Link>
          </div>
        </Reveal>

        <Reveal
          delay={0.12}
          className="mx-auto w-full max-w-[420px] md:max-w-none"
        >
          <img
            src="/img/products/blueberry-apple-strudel.jpg"
            alt="A Corica blueberry and apple strudel"
            width={800}
            height={800}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        </Reveal>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- travel ---- */

function Travel() {
  return (
    <section className="bg-green py-20 text-cream md:py-24">
      <div className="wrap">
        <Reveal className="mx-auto max-w-[680px] text-center">
          <Eyebrow>Taking one with you</Eyebrow>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] text-cream">
            A strudel that travels.
          </h2>
          <p className="mt-6 text-[1.15rem] text-cream/85">
            Plenty of our strudels leave Perth on a plane. A strudel is a great
            flying companion, as long as it is hand carried, kept upright and
            refrigerated before and after the flight.
          </p>
          <p className="mt-4 text-[1.15rem] text-cream/85">
            Each one comes in its own sturdy box. If you are buying several, you
            can also purchase a carry box or a reusable bag that fits six.
          </p>
          <ButtonLink
            to="/faqs"
            hash="strudel-travel"
            variant="cream"
            className="mt-8"
          >
            Strudel questions answered
          </ButtonLink>
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
          <Eyebrow>Order one</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[18ch] text-[clamp(2rem,4.2vw,3.2rem)]">
            Baked fresh every day.
          </h2>
          <Ornament />
          <p className="mx-auto mt-2 max-w-[52ch] text-[1.15rem] text-ink-soft">
            Order a strudel online for pickup from Aberdeen Street, call the
            shop, or come in and see us.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              search={{ category: shopCategory('strudels') }}
              className="btn btn-solid"
            >
              Order online for pickup
            </Link>
            <a href={site.phone.href} className="btn">
              Call {site.phone.display}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
