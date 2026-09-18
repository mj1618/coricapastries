import { formatCents } from '#/lib/shop/money'
import type { Product } from '#/lib/shop/types'

/**
 * Size/variant pills on a variant-group page. Each member is a real product, so the
 * price shown is that member's own. Out-of-stock members are disabled rather than
 * hidden, so the shopper can still see the full range of sizes.
 */
export function VariantPicker({
  label,
  members,
  selectedId,
  onSelect,
}: {
  label: string
  members: (Product & { displayName: string })[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <fieldset className="mt-6 border-t border-gold-soft pt-6">
      <legend className="text-[0.7rem] tracking-eyebrow text-gold uppercase">
        {label}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {members.map((member) => {
          const on = member.id === selectedId
          return (
            <button
              key={member.id}
              type="button"
              aria-pressed={on}
              disabled={!member.inStock}
              onClick={() => onSelect(member.id)}
              className={`border px-4 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                on
                  ? 'border-green bg-green text-cream'
                  : 'border-gold-soft bg-ivory text-ink hover:border-gold'
              }`}
            >
              <span className="block text-[0.98rem] leading-snug">
                {member.displayName}
              </span>
              <span
                className={`mt-0.5 block font-display text-[1.1rem] leading-none ${
                  on ? 'text-cream' : 'text-green'
                }`}
              >
                {member.inStock ? formatCents(member.priceCents) : 'Sold out'}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
