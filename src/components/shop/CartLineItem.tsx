import { Link } from '@tanstack/react-router'
import { optionFeesCents, unitPriceCents } from '#/lib/shop/checkout'
import { formatCents } from '#/lib/shop/money'
import type { CartLine, Product, VariantGroup } from '#/lib/shop/types'

/** One cart line with its product resolved against the live store snapshot. */
export type CartRow = {
  line: CartLine
  /** Null when the product has disappeared from the store since it was added. */
  product: Product | null
  group: VariantGroup | null
  /** Variant label from the group, e.g. "Medium 20 to 25 serves". */
  variantName: string | null
  status: 'ok' | 'removed' | 'sold-out'
}

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: 'Repeats weekly',
  fortnightly: 'Repeats fortnightly',
  monthly: 'Repeats monthly',
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={112}
        height={112}
        loading="lazy"
        className="h-20 w-20 border border-gold-soft/70 object-cover sm:h-28 sm:w-28"
      />
    )
  }
  return (
    <div
      className="flex h-20 w-20 items-center justify-center border border-gold-soft/70 bg-cream-deep sm:h-28 sm:w-28"
      aria-hidden="true"
      title={alt}
    >
      <svg viewBox="0 0 16 16" className="h-5 w-5 fill-gold">
        <path d="M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </svg>
    </div>
  )
}

export function CartLineItem({
  row,
  supplierLogo,
  onQuantity,
  onRemove,
}: {
  row: CartRow
  supplierLogo: string | null
  onQuantity: (key: string, quantity: number) => void
  onRemove: (key: string) => void
}) {
  const { line, product, group, variantName, status } = row
  const title = group?.name ?? product?.name ?? 'Item no longer available'
  const qty = line.quantity
  const fees = optionFeesCents(line)
  const unit = product ? unitPriceCents(line, product) : null
  const total = unit === null ? null : unit * qty
  const href = group?.slug
    ? ({
        to: '/shop/parent/$parentSlug',
        params: { parentSlug: group.slug },
      } as const)
    : product?.slug
      ? ({ to: '/shop/$slug', params: { slug: product.slug } } as const)
      : null
  const unusable = status !== 'ok'

  const heading = (
    <>
      {title}
      {variantName ? (
        <span className="text-ink-soft"> &mdash; {variantName}</span>
      ) : null}
    </>
  )

  return (
    <li className={`frame-card p-4 sm:p-6 ${unusable ? 'opacity-95' : ''}`}>
      <div className="flex gap-4 sm:gap-6">
        <div className={unusable ? 'grayscale' : ''}>
          <Thumb src={product?.image ?? supplierLogo} alt={title} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
            <h3 className="text-[1.3rem] leading-snug sm:text-[1.45rem]">
              {href && !unusable ? (
                <Link
                  to={href.to}
                  params={href.params}
                  className="text-green hover:text-red"
                >
                  {heading}
                </Link>
              ) : (
                heading
              )}
            </h3>
            {total !== null ? (
              <p className="shrink-0 font-display text-[1.35rem] text-green tabular-nums">
                {formatCents(total, { alwaysCents: true })}
              </p>
            ) : null}
          </div>

          {status === 'removed' ? (
            <p className="mt-1 text-[0.95rem] text-red">
              No longer available. Remove it to continue.
            </p>
          ) : null}
          {status === 'sold-out' ? (
            <p className="mt-1 text-[0.95rem] text-red">
              Sold out. Remove it to continue, or call the shop to ask when it
              is back.
            </p>
          ) : null}

          {line.optionsSelected.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-[0.95rem] text-ink-soft">
              {line.optionsSelected.map((o) => (
                <li key={`${o.productOptionId}-${o.value}`}>
                  <span className="text-ink">{o.name}:</span> {o.value}
                  {o.feeAmountCents ? (
                    <span className="text-green">
                      {' '}
                      (+{formatCents(o.feeAmountCents)})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {line.subscriptionFrequency ? (
            <p className="mt-2 text-[0.95rem] text-ink-soft">
              {FREQUENCY_LABEL[line.subscriptionFrequency] ??
                `Repeats ${line.subscriptionFrequency}`}
            </p>
          ) : null}

          {product?.minDeliveryDays ? (
            <p className="mt-2 text-[0.9rem] text-ink-soft italic">
              Needs {product.minDeliveryDays}{' '}
              {product.minDeliveryDays === 1 ? 'day\u2019s' : 'days\u2019'}{' '}
              notice.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {unusable ? (
              <span className="text-[0.95rem] text-ink-soft">
                Quantity {qty}
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-gold-soft bg-ivory">
                  <button
                    type="button"
                    className="h-9 w-9 text-[1.2rem] leading-none text-green disabled:opacity-35"
                    disabled={qty <= 1}
                    onClick={() => onQuantity(line.key, qty - 1)}
                    aria-label={`Decrease quantity of ${title}`}
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={qty}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      if (Number.isFinite(next) && next >= 1) {
                        onQuantity(line.key, Math.floor(next))
                      }
                    }}
                    aria-label={`Quantity of ${title}`}
                    className="w-12 border-x border-gold-soft py-1 text-center tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    className="h-9 w-9 text-[1.2rem] leading-none text-green"
                    onClick={() => onQuantity(line.key, qty + 1)}
                    aria-label={`Increase quantity of ${title}`}
                  >
                    +
                  </button>
                </div>
                {unit !== null ? (
                  <span className="text-[0.92rem] text-ink-soft">
                    {formatCents(unit, { alwaysCents: true })} each
                    {fees > 0 ? ' incl. options' : ''}
                  </span>
                ) : null}
              </div>
            )}

            <button
              type="button"
              onClick={() => onRemove(line.key)}
              className="text-[0.82rem] tracking-nav text-ink-soft uppercase hover:text-red"
            >
              Remove
              <span className="sr-only"> {title} from your cart</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
