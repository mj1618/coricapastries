import { Link, createFileRoute } from '@tanstack/react-router'
import { Reveal } from '#/components/Reveal'
import { PageHero } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import { seo } from '#/lib/seo'

/**
 * Privacy policy. Everything here describes what the site actually does
 * (see src/server/contact.ts, src/lib/shop and the GTM snippet in __root.tsx);
 * update it when a service is added or removed.
 */

const UPDATED = '22 September 2026'

export const Route = createFileRoute('/privacy')({
  head: () =>
    seo({
      title: 'Privacy Policy',
      description:
        'How Corica Pastries handles the personal information you give us through the enquiry form, the online shop and this website, and who we share it with.',
      path: '/privacy',
    }),
  component: Page,
})

const h2 = 'mt-12 text-[1.7rem] text-green first:mt-0'
const p = 'mt-4 leading-relaxed text-pretty text-ink-soft'
const ul = 'mt-4 list-disc space-y-2 pl-6 leading-relaxed text-ink-soft'
const a = 'link-gold'

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Corica Pastries"
        title="Privacy policy"
        lede={`How we handle the personal information you give us. Last updated ${UPDATED}.`}
      />

      <section className="py-16 md:py-20">
        <div className="wrap max-w-[68ch]">
          <Reveal>
            <h2 className={h2}>Who we are</h2>
            <p className={p}>
              This website is run by {site.legalName} ({site.name}), a
              patisserie at {fullAddress}. If you have any question about this
              policy or the information we hold about you, call the shop on{' '}
              <a href={site.phone.href} className={a}>
                {site.phone.display}
              </a>{' '}
              or use the{' '}
              <Link to="/contact" className={a}>
                enquiry form
              </Link>
              .
            </p>

            <h2 className={h2}>What we collect and why</h2>
            <p className={p}>
              <strong className="font-medium text-ink">Enquiries.</strong> When
              you send an enquiry we receive the name, email address, phone
              number, subject and message you enter. We use them only to reply
              to you. The message is delivered to the shop as an email through
              Resend, our email provider, and is kept for as long as we need it
              to deal with your enquiry.
            </p>
            <p className={p}>
              <strong className="font-medium text-ink">Online orders.</strong>{' '}
              Our online shop runs on SupplyWise. When you place an order or
              create a shopper account, SupplyWise collects your name, contact
              details, order history and chosen pickup day so the order can be
              prepared and collected. Payment is taken on SupplyWise's secure
              checkout; card details are handled by its payment provider and
              never reach this website or the shop. SupplyWise's own privacy
              policy applies to that information as well as ours.
            </p>
            <p className={p}>
              <strong className="font-medium text-ink">
                Your cart and favourites.
              </strong>{' '}
              Items in your cart and any products you mark as favourites are
              stored in your own browser, not on our servers, so they are still
              there when you come back.
            </p>

            <h2 className={h2}>Cookies and analytics</h2>
            <p className={p}>
              We use Google Tag Manager to run Google Analytics, Google Ads
              conversion tracking and the Meta (Facebook) pixel. These set
              cookies and record how the site is used, such as the pages you
              visit and whether you reach the checkout, so we can see which
              parts of the site are useful and measure our advertising. The data
              is processed by Google and Meta under their own privacy policies.
              You can block these cookies in your browser settings or with an ad
              blocker without affecting ordering.
            </p>
            <p className={p}>
              The enquiry form may use Cloudflare Turnstile to tell people from
              automated spam. Turnstile checks your browser without a puzzle and
              does not track you across other sites.
            </p>

            <h2 className={h2}>Who we share information with</h2>
            <ul className={ul}>
              <li>SupplyWise, which runs the online shop and checkout.</li>
              <li>Resend, which delivers enquiry emails to the shop.</li>
              <li>Vercel, which hosts this website.</li>
              <li>
                Google and Meta, for the analytics and advertising described
                above.
              </li>
              <li>Cloudflare, for the spam check on the enquiry form.</li>
            </ul>
            <p className={p}>
              We do not sell personal information, and we do not send marketing
              emails from the enquiry form.
            </p>

            <h2 className={h2}>Access and correction</h2>
            <p className={p}>
              You can ask us what information we hold about you, and ask for it
              to be corrected or deleted, by contacting the shop. Order and
              account details held by SupplyWise can also be managed from your
              shopper account.
            </p>

            <h2 className={h2}>Changes</h2>
            <p className={p}>
              If we change how the site handles personal information we will
              update this page and the date at the top.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
