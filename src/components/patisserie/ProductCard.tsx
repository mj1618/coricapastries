import { formatPrice, prettyLabel } from '#/data/catalogue'
import type { Product } from '#/data/catalogue'

/**
 * One product in a range listing: square photo, name, description, price
 * (a single figure, or a list of sizes/options) and any allergen notice.
 * These brochure cards are not clickable; adding to a cart happens in /shop,
 * which the range's OrderCard links to.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col border border-gold-soft bg-ivory">
      <img
        src={product.image}
        alt={product.name}
        width={800}
        height={800}
        loading="lazy"
        decoding="async"
        className="aspect-square w-full border-b border-gold-soft bg-white object-cover"
      />

      <div className="flex flex-1 flex-col px-5 pt-5 pb-6 text-center sm:px-6">
        <h3 className="text-[1.5rem] text-balance">{product.name}</h3>

        {product.description ? (
          <p className="mt-2 text-[1rem] leading-relaxed text-pretty text-ink-soft">
            {product.description}
          </p>
        ) : null}

        <PriceBlock product={product} />

        {product.note ? (
          <p className="mt-4 text-[0.78rem] leading-snug text-pretty text-ink-soft/85 italic">
            {product.note}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function PriceBlock({ product }: { product: Product }) {
  const { variants, optionLabel, priceFrom } = product
  const prices = variants.map((v) => v.price)
  const oneprice = prices.length > 0 && prices.every((p) => p === prices[0])

  // A range of sizes or options, each with its own price: list them.
  if (variants.length > 0 && !oneprice) {
    return (
      <dl className="mt-auto w-full pt-5 text-left">
        {optionLabel ? (
          <p className="mb-2 text-center text-[0.7rem] tracking-eyebrow text-gold uppercase">
            {optionLabel}
          </p>
        ) : null}
        <div className="border-t border-gold-soft">
          {variants.map((variant) => (
            <div
              key={variant.label}
              className="flex items-baseline gap-2 border-b border-gold-soft/60 py-1.5"
            >
              <dt className="text-[0.95rem] text-ink-soft">
                {prettyLabel(variant.label)}
              </dt>
              <span aria-hidden="true" className="flex-1" />
              <dd className="font-display text-[1.25rem] whitespace-nowrap text-green">
                {formatPrice(variant.price)}
              </dd>
            </div>
          ))}
        </div>
      </dl>
    )
  }

  // One price, optionally with a choice of filling or flavour at that price.
  const single = oneprice ? prices[0] : priceFrom
  if (single == null) return null

  return (
    <div className="mt-auto w-full border-t border-gold-soft pt-4">
      <p className="font-display text-[1.7rem] leading-none text-green">
        {formatPrice(single)}
      </p>
      {oneprice && variants.length > 1 ? (
        <p className="mt-2 text-[0.9rem] text-ink-soft">
          <span className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
            {optionLabel ?? 'Options'}
          </span>
          <span className="mt-1 block">
            {variants.map((v) => prettyLabel(v.label)).join(' · ')}
          </span>
        </p>
      ) : null}
    </div>
  )
}
