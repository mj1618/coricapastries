import { useFavourites } from '#/lib/shop/favourites'

/** Heart toggle. Works logged-out (localStorage) and syncs to the account when logged in. */
export function FavouriteButton({
  productId,
  className = '',
  size = 20,
}: {
  productId: string
  className?: string
  size?: number
}) {
  const { isFavourite, toggle } = useFavourites()
  const on = isFavourite(productId)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
      }}
      aria-pressed={on}
      aria-label={on ? 'Remove from favourites' : 'Save to favourites'}
      title={on ? 'Remove from favourites' : 'Save to favourites'}
      className={`inline-grid place-items-center rounded-full border border-gold-soft bg-ivory/90 p-2 text-red transition-colors hover:border-gold ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2 0 3.4 1.1 4.4 2.5C12 6.1 13.4 5 15.4 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  )
}
