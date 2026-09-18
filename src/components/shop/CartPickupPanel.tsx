import { Eyebrow } from '#/components/ui'
import { fullAddress, site } from '#/data/site'
import {
  describeSchedule,
  formatIsoDate,
  nextAvailableDate,
  scheduleFor,
} from '#/lib/shop/checkout'
import type { Fulfilment } from '#/lib/shop/checkout'
import type { Store } from '#/lib/shop/types'

/**
 * Where and when the order is collected. Deliberately vague about dates: the
 * SupplyWise checkout owns the calendar, so we only spell out an exact date when
 * the supplier's schedule sets `requireDate`.
 */
export function CartPickupPanel({
  store,
  fulfilment,
  noticeDays,
}: {
  store: Store
  fulfilment: Fulfilment | null
  noticeDays: number
}) {
  const schedule = scheduleFor(store, fulfilment)
  const isPickup = fulfilment !== 'delivery'
  const sentences = describeSchedule(schedule, isPickup ? 'pickup' : 'delivery')
  const requiredDate = schedule?.requireDate
    ? nextAvailableDate(schedule, noticeDays)
    : null

  return (
    <aside className="frame-card p-6 sm:p-7">
      <Eyebrow green>{isPickup ? 'Collecting your order' : 'Delivery'}</Eyebrow>
      <h2 className="mt-2 text-[1.5rem]">
        {isPickup ? 'Pickup from the shop' : 'Delivered to you'}
      </h2>

      {isPickup ? (
        <p className="mt-3 text-[0.98rem] text-ink-soft">
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="link-gold"
          >
            {fullAddress}
          </a>
          <br />
          {site.address.landmark}.
        </p>
      ) : null}

      <dl className="mt-5 border-t border-gold-soft pt-4 text-[0.95rem]">
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
      <p className="mt-3 text-[0.85rem] text-ink-soft italic">
        {site.hoursNote}
      </p>

      {sentences.length > 0 ? (
        <ul className="mt-5 space-y-1.5 border-t border-gold-soft pt-4 text-[0.95rem] text-ink-soft">
          {sentences.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}

      {noticeDays > 0 ? (
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          Some items in your cart need {noticeDays}{' '}
          {noticeDays === 1 ? 'day\u2019s' : 'days\u2019'} notice, so the
          earliest {isPickup ? 'pickup' : 'delivery'} day allows for that.
        </p>
      ) : null}

      {requiredDate ? (
        <p className="mt-4 border-t border-gold-soft pt-4 text-[0.95rem]">
          <span className="text-ink-soft">
            Earliest {isPickup ? 'pickup' : 'delivery'} date:
          </span>{' '}
          <span className="text-green">{formatIsoDate(requiredDate)}</span>
          <br />
          <span className="text-[0.88rem] text-ink-soft">
            You can change this at checkout.
          </span>
        </p>
      ) : (
        <p className="mt-4 text-[0.88rem] text-ink-soft italic">
          You choose your {isPickup ? 'pickup' : 'delivery'} day at checkout.
        </p>
      )}

      <p className="mt-5 text-[0.95rem] text-ink-soft">
        Questions about an order?{' '}
        <a href={site.phone.href} className="link-gold">
          {site.phone.display}
        </a>
      </p>
    </aside>
  )
}
