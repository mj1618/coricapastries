import { useState } from 'react'
import {
  AccountProductGrid,
  AccountProductTile,
} from '#/components/shop/AccountProductTile'
import {
  AccountNotice,
  AccountSection,
  AccountSkeleton,
  useAccountResource,
} from '#/components/shop/AccountUi'
import { getPreviouslyOrdered } from '#/lib/shop/auth'
import type { Store } from '#/lib/shop/types'

const INITIAL_COUNT = 8

/** Everything this shopper has ordered before, most-ordered first. */
export function AccountBuyAgain({ store }: { store: Store }) {
  const { status, data, error, reload } = useAccountResource(
    getPreviouslyOrdered,
    'Could not load your previous orders.',
  )
  const [showAll, setShowAll] = useState(false)

  const entries = Object.entries(data?.previouslyOrdered ?? {}).sort(
    (a, b) => b[1] - a[1],
  )
  const shown = showAll ? entries : entries.slice(0, INITIAL_COUNT)

  return (
    <AccountSection
      id="buy-again"
      eyebrow="Order again"
      title="Buy again"
      lede="The pastries you have ordered before, ready to go back in the basket."
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
      ) : entries.length === 0 ? (
        <AccountNotice>
          <p>Nothing here yet — your past orders will appear once you order.</p>
        </AccountNotice>
      ) : (
        <>
          <AccountProductGrid>
            {shown.map(([productId, quantity]) => (
              <AccountProductTile
                key={productId}
                store={store}
                productId={productId}
                meta={`Ordered ${quantity}× before`}
              />
            ))}
          </AccountProductGrid>
          {entries.length > INITIAL_COUNT ? (
            <p className="mt-8 text-center">
              <button
                type="button"
                className="btn"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll
                  ? 'Show fewer'
                  : `Show all ${entries.length} past items`}
              </button>
            </p>
          ) : null}
        </>
      )}
    </AccountSection>
  )
}
