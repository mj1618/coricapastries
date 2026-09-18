import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Reveal } from '#/components/Reveal'
import { ButtonLink, Eyebrow, Ornament, PageHero } from '#/components/ui'
import { faqs } from '#/data/faqs'
import type { FaqItem } from '#/data/faqs'
import { fullAddress, site } from '#/data/site'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/faqs')({
  head: () =>
    seo({
      title: 'FAQs',
      description:
        'Answers to the questions we are asked most: how long the apple strudel keeps, how many it serves, ordering and custom cakes, wholesale, parking and our Northbridge trading hours.',
      path: '/faqs',
    }),
  component: Page,
})

/* --------------------------------------------------- answer text helpers ---- */

const hoursPlain = `${site.hours.map((h) => `${h.days}: ${h.time}`).join('. ')}.`

/** Flattens an answer (tokens and all) to plain text for the FAQPage JSON-LD. */
function plainAnswer(item: FaqItem): string {
  const text = item.a
    .replace(/\{hours\}/g, hoursPlain)
    .replace(/\{phone\}/g, site.phone.display)
    .replace(/\{address\}/g, fullAddress)
    .replace(/\n\n/g, ' ')
  return item.cta ? `${text} (${item.cta.label}.)` : text
}

/** Renders the inline {phone} / {address} tokens inside one paragraph. */
function renderInline(text: string): Array<ReactNode> {
  return text.split(/(\{phone\}|\{address\})/).map((chunk, i) => {
    if (chunk === '{phone}') {
      return (
        <a key={i} href={site.phone.href} className="link-gold">
          {site.phone.display}
        </a>
      )
    }
    if (chunk === '{address}') {
      return <span key={i}>{fullAddress}</span>
    }
    return <span key={i}>{chunk}</span>
  })
}

function Answer({ item }: { item: FaqItem }) {
  return (
    <div className="space-y-3 text-ink-soft">
      {item.a.split('\n\n').map((para, i) =>
        para === '{hours}' ? (
          <dl
            key={i}
            className="grid max-w-[28rem] grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-y border-gold-soft py-4 sm:gap-x-8"
          >
            {site.hours.map((h) => (
              <div key={h.days} className="contents">
                <dt className="font-medium text-ink">{h.days}</dt>
                <dd className="text-right whitespace-nowrap">{h.time}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p key={i}>{renderInline(para)}</p>
        ),
      )}
      {item.cta ? (
        <p>
          <Link to={item.cta.to as '/'} className="link-gold">
            {item.cta.label}
          </Link>
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------- accordion ---- */

function Question({ item }: { item: FaqItem }) {
  return (
    <details
      id={item.id}
      className="group scroll-mt-32 border-b border-gold-soft"
    >
      <summary className="flex cursor-pointer list-none items-start gap-5 py-5 [&::-webkit-details-marker]:hidden">
        <h3 className="flex-1 font-display text-[1.35rem] leading-snug text-green transition-colors group-hover:text-red sm:text-[1.55rem]">
          {item.q}
        </h3>
        <span
          className="relative mt-1.5 block h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-current" />
          <span className="absolute top-0 left-1/2 h-4 w-px -translate-x-1/2 bg-current" />
        </span>
      </summary>
      <div className="pb-6 sm:pr-10">
        <Answer item={item} />
      </div>
    </details>
  )
}

/* ------------------------------------------------------------------ page ---- */

function Page() {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: plainAnswer(item) },
      })),
    ),
  }).replace(/</g, '\\u003c')

  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions."
        lede={
          <>
            The things we are asked most often. For anything else, call the shop
            on{' '}
            <a
              href={site.phone.href}
              className="border-b border-gold-soft whitespace-nowrap not-italic hover:text-gold-soft"
            >
              {site.phone.display}
            </a>
            .
          </>
        }
      />

      {/* Jump links: three groups, so the whole page is reachable in one tap. */}
      <nav
        aria-label="Question topics"
        className="border-b border-gold-soft bg-ivory"
      >
        <ul className="wrap flex flex-wrap justify-center gap-x-8 gap-y-2 py-5 text-[0.78rem] tracking-[0.2em] text-green uppercase">
          {faqs.map((group) => (
            <li key={group.id}>
              <a
                href={`#${group.id}`}
                className="border-b border-transparent pb-1 transition-colors hover:border-gold"
              >
                {group.group}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="wrap max-w-[860px] py-16 md:py-20">
        {faqs.map((group, gi) => (
          <section
            key={group.id}
            id={group.id}
            className={`scroll-mt-28 ${gi > 0 ? 'mt-16 md:mt-20' : ''}`}
          >
            <Reveal className="text-center">
              <Eyebrow>{`0${gi + 1}`}</Eyebrow>
              <h2 className="mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)]">
                {group.group}
              </h2>
              <p className="mt-2 text-ink-soft italic">{group.blurb}</p>
              <Ornament />
            </Reveal>

            <Reveal delay={0.1} className="mt-6 border-t border-gold-soft">
              {group.items.map((item) => (
                <Question key={item.id} item={item} />
              ))}
            </Reveal>
          </section>
        ))}

        <Reveal className="mt-16 md:mt-20">
          <div className="frame-card px-8 py-10 text-center sm:px-12 sm:py-12">
            <Eyebrow green>Still have a question?</Eyebrow>
            <h2 className="mx-auto mt-3 max-w-[22ch] text-[clamp(1.8rem,3.4vw,2.6rem)]">
              The shop team is happy to help.
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-ink-soft">
              Call us during trading hours to talk through a custom order, or
              send us a message and we will get back to you.
            </p>
            <p className="mt-6 font-display text-[2.2rem] text-green">
              <a href={site.phone.href} className="hover:text-red">
                {site.phone.display}
              </a>
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <ButtonLink to="/contact" variant="solid">
                Contact us
              </ButtonLink>
              <ButtonLink to="/patisserie">View the Patisserie</ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </>
  )
}
