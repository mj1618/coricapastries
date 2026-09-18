import { useState } from 'react'
import {
  AccountBadge,
  AccountNotice,
  AccountSection,
  AccountSkeleton,
  formatDay,
  humanise,
  optionalText,
  useAccountResource,
} from '#/components/shop/AccountUi'
import {
  cancelSubscription,
  describeError,
  getSubscriptions,
  pauseSubscription,
  resumeSubscription,
} from '#/lib/shop/auth'
import { formatCents } from '#/lib/shop/money'
import type { Subscription } from '#/lib/shop/types'

/** Recurring orders, with pause / resume / cancel. Cancelling asks first. */
export function AccountSubscriptions() {
  const { status, data, error, reload } = useAccountResource(
    getSubscriptions,
    'Could not load your subscriptions.',
  )
  const subscriptions = data?.subscriptions ?? []

  return (
    <AccountSection
      id="subscriptions"
      eyebrow="Repeat orders"
      title="Your subscriptions"
      lede="Subscriptions are created during checkout on SupplyWise. Manage them here."
    >
      {status === 'loading' ? (
        <AccountSkeleton rows={2} />
      ) : status === 'error' ? (
        <AccountNotice tone="warning">
          <p>{error}</p>
          <p className="mt-4">
            <button type="button" className="btn" onClick={() => void reload()}>
              Try again
            </button>
          </p>
        </AccountNotice>
      ) : subscriptions.length === 0 ? (
        <AccountNotice>
          <p>No subscriptions.</p>
        </AccountNotice>
      ) : (
        <ul className="space-y-4">
          {subscriptions.map((subscription) => (
            <SubscriptionRow
              key={subscription.id}
              subscription={subscription}
              onChanged={() => void reload()}
            />
          ))}
        </ul>
      )}
    </AccountSection>
  )
}

function SubscriptionRow({
  subscription,
  onChanged,
}: {
  subscription: Subscription
  onChanged: () => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const run = async (
    action: 'pause' | 'resume' | 'cancel',
    fn: (id: string) => Promise<unknown>,
  ) => {
    if (
      action === 'cancel' &&
      !window.confirm(
        'Cancel this subscription? No further orders will be created for it.',
      )
    ) {
      return
    }
    if (
      action === 'pause' &&
      !window.confirm('Pause this subscription? You can resume it at any time.')
    ) {
      return
    }
    setBusy(action)
    setActionError(null)
    try {
      await fn(subscription.id)
      onChanged()
    } catch (err) {
      setActionError(
        describeError(err, `Could not ${action} the subscription.`),
      )
    } finally {
      setBusy(null)
    }
  }

  const next = formatDay(subscription.nextOrderDate)
  const frequency = optionalText(subscription.frequency)
  const fulfilment = optionalText(subscription.pickupOrDelivery)

  return (
    <li className="frame-card px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-[1.35rem] text-green capitalize">
            {frequency ? `${humanise(frequency)} order` : 'Recurring order'}
          </h3>
          <p className="mt-1 text-[1rem] text-ink-soft">
            {next ? `Next order ${next}` : 'Next order date not set'}
            {fulfilment ? (
              <span className="capitalize"> · {humanise(fulfilment)}</span>
            ) : null}
          </p>
          <div className="mt-3">
            <AccountBadge status={subscription.status} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          {subscription.status === 'paused' ? (
            <button
              type="button"
              className="btn btn-solid"
              disabled={busy !== null}
              onClick={() => void run('resume', resumeSubscription)}
            >
              {busy === 'resume' ? 'Resuming…' : 'Resume'}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              disabled={busy !== null}
              onClick={() => void run('pause', pauseSubscription)}
            >
              {busy === 'pause' ? 'Pausing…' : 'Pause'}
            </button>
          )}
          <button
            type="button"
            className="btn"
            disabled={busy !== null}
            onClick={() => void run('cancel', cancelSubscription)}
          >
            {busy === 'cancel' ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>
      </div>

      {subscription.items.length > 0 ? (
        <ul className="mt-5 border-t border-gold-soft pt-4 text-[1rem] text-ink-soft">
          {subscription.items.map((item, i) => (
            <li
              key={`${item.productId}-${i}`}
              className="flex justify-between gap-4 py-1"
            >
              <span>
                {item.quantity} × {item.name}
                {item.optionsSelected.length > 0 ? (
                  <span className="text-ink-soft/80">
                    {' '}
                    (
                    {item.optionsSelected
                      .map((o) => `${o.name}: ${o.value}`)
                      .join(', ')}
                    )
                  </span>
                ) : null}
              </span>
              <span className="whitespace-nowrap">
                {formatCents(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {actionError ? (
        <p
          className="mt-4 border border-red/40 bg-red/5 px-4 py-3 text-[1rem]"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}
    </li>
  )
}
