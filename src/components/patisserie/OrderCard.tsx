import { Link } from '@tanstack/react-router'
import { Eyebrow, Ornament } from '#/components/ui'
import { site } from '#/data/site'

/**
 * "Order this range" card. Sticky alongside the product grid on desktop,
 * and repeated after the grid on a phone by simply being placed last.
 */
export function OrderCard({ rangeName }: { rangeName: string }) {
  return (
    <aside className="frame-card p-7 text-center sm:p-8 lg:sticky lg:top-28">
      <Eyebrow green>Order this range</Eyebrow>
      <h2 className="mt-2 text-[1.75rem]">By phone or in store</h2>
      <Ornament className="my-4" />

      <p className="text-[0.98rem] text-ink-soft">
        There is no online cart. Call the shop and one of our team will take
        your order for {rangeName.toLowerCase()}.
      </p>

      <a
        href={site.phone.href}
        className="mt-4 block font-display text-[2rem] leading-tight text-green hover:text-red"
      >
        {site.phone.display}
      </a>

      <dl className="mt-6 border-t border-gold-soft pt-4 text-left text-[0.95rem]">
        {site.hours.map((row) => (
          <div
            key={row.days}
            className="flex items-baseline justify-between gap-3 border-b border-gold-soft/60 py-1.5"
          >
            <dt className="text-ink-soft">{row.days}</dt>
            <dd className="whitespace-nowrap text-green">{row.time}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[0.85rem] text-ink-soft italic">
        Some items need 48&ndash;72 hours&rsquo; notice. {site.hoursNote}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <a href={site.phone.href} className="btn btn-solid">
          Call the shop
        </a>
        <Link to="/contact" className="btn">
          Contact us
        </Link>
      </div>

      <p className="mt-5 text-[0.9rem] text-ink-soft">
        {site.address.street}, {site.address.suburb}
      </p>
    </aside>
  )
}

/** Standing disclaimer wherever prices are shown. */
export function PriceNote({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-center text-[0.9rem] text-ink-soft italic ${className}`}
    >
      Prices are a guide only and may change. Please call to confirm current
      pricing and availability.
    </p>
  )
}
