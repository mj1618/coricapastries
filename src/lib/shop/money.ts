/** Formats integer cents as AUD, e.g. 550 → "$5.50", 3300 → "$33". */
export function formatCents(
  cents: number,
  opts: { alwaysCents?: boolean } = {},
) {
  const dollars = cents / 100
  const whole = Number.isInteger(dollars) && !opts.alwaysCents
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

/** GST component of a GST-inclusive amount, matching SupplyWise's rounding. */
export function gstComponent(inclGstCents: number) {
  return Math.round((inclGstCents / 1.1) * 0.1)
}
