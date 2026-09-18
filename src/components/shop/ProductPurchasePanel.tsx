import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { useCart } from '#/lib/shop/cart'
import { formatCents } from '#/lib/shop/money'
import type {
  OptionSelected,
  Product,
  ProductOption,
  SubscriptionFrequency,
} from '#/lib/shop/types'

const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
]

/** Select options preselect their first value, mirroring the SupplyWise store. */
function defaultSelections(options: ProductOption[]) {
  const out: Record<string, string> = {}
  for (const option of options) {
    out[option.id] =
      option.type === 'select' ? (option.values[0]?.name ?? '') : ''
  }
  return out
}

/**
 * Options, quantity, subscription frequency and add-to-cart for one product. Used by
 * both the product page and the variant-group page — the group passes the selected
 * member and the options scoped to it, so the panel never needs to know about parents.
 */
export function ProductPurchasePanel({
  product,
  options,
  subscribable,
  displayName,
}: {
  product: Product
  options: ProductOption[]
  subscribable: boolean
  /** Variant wording for the confirmation, e.g. "Black Forrest Torta — Medium". */
  displayName?: string
}) {
  const { add, hydrated } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [frequency, setFrequency] = useState<'once' | SubscriptionFrequency>(
    'once',
  )
  const [added, setAdded] = useState<{ quantity: number } | null>(null)

  // Reset the option choices whenever the product (or its option set) changes.
  const signature = `${product.id}:${options.map((o) => o.id).join('|')}`
  const [signatureSeen, setSignatureSeen] = useState(signature)
  const [selections, setSelections] = useState(() => defaultSelections(options))
  if (signatureSeen !== signature) {
    setSignatureSeen(signature)
    setSelections(defaultSelections(options))
    setAdded(null)
  }

  const optionsSelected = buildOptionsSelected(options, selections)
  const feesCents = optionsSelected.reduce(
    (n, o) => n + (o.feeAmountCents ?? 0),
    0,
  )
  const unitCents = product.priceCents + feesCents
  const totalCents = unitCents * quantity
  const name = displayName ?? product.name

  return (
    <div>
      {options.length > 0 ? (
        <div className="mt-8 space-y-6 border-t border-gold-soft pt-7">
          {options.map((option) => (
            <OptionField
              key={option.id}
              option={option}
              value={selections[option.id] ?? ''}
              onChange={(value) =>
                setSelections((s) => ({ ...s, [option.id]: value }))
              }
            />
          ))}
        </div>
      ) : null}

      {subscribable ? (
        <SubscribeField value={frequency} onChange={setFrequency} />
      ) : null}

      <div className="mt-8 flex flex-wrap items-end gap-5 border-t border-gold-soft pt-7">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          disabled={!product.inStock}
        />

        <div className="min-w-[8rem]">
          <p className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
            Total
          </p>
          <p className="mt-1 font-display text-[1.9rem] leading-none text-green">
            {formatCents(totalCents)}
          </p>
          {feesCents > 0 ? (
            <p className="mt-1 text-[0.8rem] text-ink-soft">
              {formatCents(product.priceCents)} + {formatCents(feesCents)}{' '}
              options
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        disabled={!product.inStock || !hydrated}
        onClick={() => {
          add({
            productId: product.id,
            quantity,
            optionsSelected,
            subscriptionFrequency: frequency === 'once' ? undefined : frequency,
          })
          setAdded({ quantity })
        }}
        className="btn btn-solid mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {product.inStock ? 'Add to cart' : 'Sold out'}
      </button>

      {added ? (
        <div
          role="status"
          className="mt-4 border border-gold-soft bg-green-soft/60 px-4 py-4 text-center"
        >
          <p className="font-display text-[1.25rem] text-green">
            Added to your cart
          </p>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            {added.quantity} × {name}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.75rem] tracking-nav uppercase">
            <Link
              to="/shop/cart"
              className="border-b border-gold pb-0.5 text-green hover:text-red"
            >
              View cart
            </Link>
            <Link
              to="/shop"
              className="border-b border-gold pb-0.5 text-green hover:text-red"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------- the fields */

function buildOptionsSelected(
  options: ProductOption[],
  selections: Record<string, string>,
): OptionSelected[] {
  const out: OptionSelected[] = []
  for (const option of options) {
    const value = (selections[option.id] ?? '').trim()
    if (!value) continue
    const fee = option.values.find((v) => v.name === value)?.feeAmountCents ?? 0
    out.push({
      productOptionId: option.id,
      name: option.name,
      value,
      ...(fee > 0 ? { feeAmountCents: fee } : {}),
    })
  }
  return out
}

function OptionField({
  option,
  value,
  onChange,
}: {
  option: ProductOption
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const label = option.selectionLabel?.trim() || option.name

  if (option.type === 'custom_text') {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-[0.7rem] tracking-eyebrow text-gold uppercase"
        >
          {label}{' '}
          <span className="tracking-normal text-ink-soft normal-case italic">
            (optional)
          </span>
        </label>
        {option.description ? (
          <p className="mt-1 text-[0.9rem] text-ink-soft">
            {option.description}
          </p>
        ) : null}
        <input
          id={id}
          type="text"
          maxLength={120}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Leave blank if not needed"
          className="mt-2 w-full border border-gold-soft bg-ivory px-3 py-2.5 text-[1rem] text-ink placeholder:text-ink-soft/60 focus:border-gold focus:outline-none"
        />
      </div>
    )
  }

  const short =
    option.values.length <= 4 && option.values.every((v) => v.name.length <= 26)

  if (short) {
    return (
      <fieldset>
        <legend className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
          {label}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {option.values.map((v) => {
            const on = v.name === value
            return (
              <button
                key={v.name}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(v.name)}
                className={`border px-3.5 py-2 text-[0.92rem] transition-colors ${
                  on
                    ? 'border-green bg-green text-cream'
                    : 'border-gold-soft bg-ivory text-ink hover:border-gold'
                }`}
              >
                {v.name}
                {v.feeAmountCents > 0 ? (
                  <span className={on ? 'text-cream/80' : 'text-ink-soft'}>
                    {' '}
                    + {formatCents(v.feeAmountCents)}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </fieldset>
    )
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.7rem] tracking-eyebrow text-gold uppercase"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-gold-soft bg-ivory px-3 py-2.5 text-[1rem] text-ink focus:border-gold focus:outline-none"
      >
        {option.values.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name}
            {v.feeAmountCents > 0
              ? ` (+ ${formatCents(v.feeAmountCents)})`
              : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

function SubscribeField({
  value,
  onChange,
}: {
  value: 'once' | SubscriptionFrequency
  onChange: (value: 'once' | SubscriptionFrequency) => void
}) {
  return (
    <fieldset className="mt-8 border-t border-gold-soft pt-7">
      <legend className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
        Subscribe &amp; save
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { value: 'once' as const, label: 'One-off order' },
          ...FREQUENCIES,
        ].map((choice) => {
          const on = choice.value === value
          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(choice.value)}
              className={`border px-3.5 py-2 text-[0.92rem] transition-colors ${
                on
                  ? 'border-green bg-green text-cream'
                  : 'border-gold-soft bg-ivory text-ink hover:border-gold'
              }`}
            >
              {choice.label}
            </button>
          )
        })}
      </div>
      {value !== 'once' ? (
        <p className="mt-2 text-[0.9rem] text-ink-soft">
          Repeat orders are set up when you complete checkout.
        </p>
      ) : null}
    </fieldset>
  )
}

function QuantityStepper({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.7rem] tracking-eyebrow text-gold uppercase"
      >
        Quantity
      </label>
      <div className="mt-2 inline-flex items-stretch border border-gold-soft bg-ivory">
        <StepButton
          label="Decrease quantity"
          disabled={disabled || value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          −
        </StepButton>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const next = Number.parseInt(e.target.value, 10)
            onChange(
              Number.isFinite(next) ? Math.min(99, Math.max(1, next)) : 1,
            )
          }}
          className="w-14 border-x border-gold-soft bg-transparent text-center text-[1.05rem] text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <StepButton
          label="Increase quantity"
          disabled={disabled || value >= 99}
          onClick={() => onChange(Math.min(99, value + 1))}
        >
          +
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="px-3.5 text-[1.15rem] leading-none text-green transition-colors hover:bg-green-soft disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
