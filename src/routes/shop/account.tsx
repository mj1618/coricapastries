import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AccountBuyAgain } from '#/components/shop/AccountBuyAgain'
import { AccountOrders } from '#/components/shop/AccountOrders'
import {
  AccountProductGrid,
  AccountProductTile,
} from '#/components/shop/AccountProductTile'
import { AccountSubscriptions } from '#/components/shop/AccountSubscriptions'
import { AccountSync } from '#/components/shop/AccountSync'
import {
  AccountNotice,
  AccountSection,
  AccountSkeleton,
} from '#/components/shop/AccountUi'
import { Eyebrow, Ornament, PageHero } from '#/components/ui'
import { initAuth, profileEmail, profileName, useAuth } from '#/lib/shop/auth'
import { useFavourites } from '#/lib/shop/favourites'
import type { Store } from '#/lib/shop/types'
import { seo } from '#/lib/seo'

const shopRoute = getRouteApi('/shop')

export const Route = createFileRoute('/shop/account')({
  // A shopper's account page should never be indexed.
  head: () =>
    seo({
      title: 'Your account',
      description:
        'Log in to see your saved favourites, past orders and invoices, and to manage your repeat orders from Corica Pastries.',
      path: '/shop/account',
      noindex: true,
    }),
  component: Page,
})

/**
 * /shop/account — the shopper account page and the OAuth `redirect_uri` for the
 * SupplyWise "retail" grant. All auth state is client-only (tokens live in
 * localStorage), so the page renders a neutral skeleton until the session is known.
 */
function Page() {
  const { store } = shopRoute.useLoaderData()
  const { status, profile, error, login, logout } = useAuth()

  // Belt and braces: <AccountSync /> does this too, and initAuth() is idempotent.
  useEffect(() => {
    void initAuth()
  }, [])

  return (
    <>
      <AccountSync />
      <PageHero
        eyebrow="Shop"
        title="Your account"
        lede="Favourites, past orders and repeat orders — kept with your SupplyWise account so they follow you between devices."
      />

      <div className="wrap max-w-[1040px] py-14 md:py-20">
        {error ? (
          <div className="mb-10">
            <AccountNotice tone="warning">
              <p>{error}</p>
            </AccountNotice>
          </div>
        ) : null}

        {status === 'loading' ? (
          <LoadingPanel />
        ) : status === 'authenticated' ? (
          <SignedIn
            store={store}
            onLogOut={logout}
            profileName={profileName(profile)}
            email={profileEmail(profile)}
          />
        ) : (
          <SignedOut onLogIn={() => void login()} />
        )}
      </div>
    </>
  )
}

/* ---------------------------------------------------------------- states ---- */

function LoadingPanel() {
  return (
    <div className="mx-auto max-w-[680px]">
      <p className="mb-6 text-center text-ink-soft italic">
        Checking your session…
      </p>
      <AccountSkeleton rows={3} />
    </div>
  )
}

function SignedOut({ onLogIn }: { onLogIn: () => void }) {
  return (
    <div className="frame-card mx-auto max-w-[760px] px-7 py-12 text-center sm:px-12">
      <Eyebrow green>Sign in</Eyebrow>
      <h2 className="mx-auto mt-3 max-w-[22ch] text-[clamp(1.9rem,3.6vw,2.6rem)]">
        An account keeps your shop with you.
      </h2>
      <Ornament />

      <dl className="mx-auto mt-6 grid max-w-[620px] gap-6 text-left sm:grid-cols-3 sm:text-center">
        {[
          {
            title: 'Favourites everywhere',
            body: 'The pastries you heart are saved to your account, on every device.',
          },
          {
            title: 'Orders & invoices',
            body: 'Every past order, its status and a printable tax invoice.',
          },
          {
            title: 'Repeat orders',
            body: 'Pause, resume or cancel a standing weekly or monthly order.',
          },
        ].map((item) => (
          <div key={item.title}>
            <dt className="font-display text-[1.25rem] text-green">
              {item.title}
            </dt>
            <dd className="mt-1 text-[1rem] text-ink-soft">{item.body}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-9">
        <button type="button" className="btn btn-solid" onClick={onLogIn}>
          Log in with SupplyWise
        </button>
      </p>
      <p className="mx-auto mt-5 max-w-[46ch] text-[1rem] text-ink-soft italic">
        Sign-in is handled by SupplyWise, who take the payment for online
        orders. You do not need an account to shop — checkout works perfectly
        well as a guest.
      </p>
      <p className="mt-6">
        <Link to="/shop" className="link-gold">
          Continue shopping
        </Link>
      </p>
    </div>
  )
}

function SignedIn({
  store,
  onLogOut,
  profileName: name,
  email,
}: {
  store: Store
  onLogOut: () => void
  profileName: string | null
  email: string | null
}) {
  const { ids } = useFavourites()

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center gap-4 pb-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-[clamp(1.7rem,3.2vw,2.2rem)] text-green">
            {name ? `Welcome back, ${name}.` : 'Welcome back.'}
          </h2>
          {email ? (
            <p className="mt-1 text-[1rem] text-ink-soft">{email}</p>
          ) : null}
        </div>
        <button type="button" className="btn" onClick={onLogOut}>
          Log out
        </button>
      </div>

      <AccountSection
        id="favourites"
        eyebrow="Saved"
        title="Your favourites"
        lede="Hearted pastries, synced to your account."
      >
        {ids.length === 0 ? (
          <AccountNotice>
            <p>
              Nothing saved yet. Tap the heart on any pastry to keep it here.
            </p>
            <p className="mt-4">
              <Link to="/shop" className="btn btn-solid">
                Browse the shop
              </Link>
            </p>
          </AccountNotice>
        ) : (
          <AccountProductGrid>
            {ids.map((productId) => (
              <AccountProductTile
                key={productId}
                store={store}
                productId={productId}
              />
            ))}
          </AccountProductGrid>
        )}
      </AccountSection>

      <AccountBuyAgain store={store} />
      <AccountOrders />
      <AccountSubscriptions />

      <div className="border-t border-gold-soft pt-10 text-center">
        <button type="button" className="btn" onClick={onLogOut}>
          Log out
        </button>
      </div>
    </div>
  )
}
