import { ApiError, BLOCKER_HINT, isNetworkError } from './api'
import type {
  CartLine,
  Product,
  Schedule,
  ShippingProfile,
  Store,
} from './types'

/* ------------------------------------------------------------------ *
 * Fulfilment
 * ------------------------------------------------------------------ */

export type Fulfilment = 'pickup' | 'delivery'

/**
 * Which fulfilment options this supplier offers, in the order to present them.
 * `pickup-only` → pickup only; otherwise delivery, plus pickup when `allowPickup`.
 * An empty array means "no shipping profile" — let SupplyWise decide at checkout.
 */
export function fulfilmentOptions(
  shipping: ShippingProfile | null,
): Fulfilment[] {
  if (!shipping) return []
  if (shipping.shippingType === 'pickup-only') return ['pickup']
  return shipping.allowPickup ? ['pickup', 'delivery'] : ['delivery']
}

/**
 * The line to show where a storefront would otherwise price delivery.
 * We never price delivery ourselves — SupplyWise does that at checkout.
 */
export function fulfilmentNote(
  shipping: ShippingProfile | null,
  fulfilment: Fulfilment | null,
) {
  if (fulfilment === 'pickup' || shipping?.shippingType === 'pickup-only') {
    return 'Pickup from the shop — no delivery charge'
  }
  return 'Shipping calculated at checkout'
}

/** Minimum order value that applies to this fulfilment method, in cents (0 = none). */
export function minOrderCents(
  shipping: ShippingProfile | null,
  fulfilment: Fulfilment | null,
) {
  if (!shipping) return 0
  const specific =
    fulfilment === 'pickup'
      ? shipping.minOrderAmountPickupCents
      : fulfilment === 'delivery'
        ? shipping.minOrderAmountDeliveryCents
        : null
  if (specific && specific > 0) return specific
  return shipping.minOrderAmountCents && shipping.minOrderAmountCents > 0
    ? shipping.minOrderAmountCents
    : 0
}

/* ------------------------------------------------------------------ *
 * Pickup / delivery schedule, in plain English
 * ------------------------------------------------------------------ */

const WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const titled = (day: string) => day.charAt(0).toUpperCase() + day.slice(1)

/** The API is trusted but not guaranteed; these keep a missing field from throwing. */
function asArray(value: string[] | undefined): string[] {
  return Array.isArray(value) ? value : []
}
function asNumber(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** "monday"…"saturday" → "Monday to Saturday"; gaps → "Monday, Wednesday and Friday". */
export function describeDays(days: string[] | undefined): string | null {
  const list = asArray(days)
  const ordered = WEEK.filter((d) => list.some((x) => x.toLowerCase() === d))
  if (ordered.length === 0) return null
  if (ordered.length === 1) return titled(ordered[0])
  const first = WEEK.indexOf(ordered[0])
  const last = WEEK.indexOf(ordered[ordered.length - 1])
  const contiguous = last - first + 1 === ordered.length
  if (contiguous) return `${titled(ordered[0])} to ${titled(ordered[last])}`
  const names = ordered.map(titled)
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** "18:00" → "6pm", "18:30" → "6.30pm". Returns the raw string if it can't parse. */
export function describeTime(time: string) {
  const m = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!m) return time
  const h24 = Number(m[1])
  const mins = Number(m[2])
  const suffix = h24 >= 12 ? 'pm' : 'am'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return mins === 0 ? `${h12}${suffix}` : `${h12}.${m[2]}${suffix}`
}

/**
 * Factual sentences describing a pickup/delivery schedule. No exact dates —
 * the hosted checkout owns the calendar (see `nextAvailableDate` for the
 * `requireDate` case).
 */
export function describeSchedule(
  schedule: Schedule | null,
  fulfilment: Fulfilment = 'pickup',
): string[] {
  if (!schedule) return []
  const word = fulfilment === 'pickup' ? 'Pickup' : 'Delivery'
  const lower = fulfilment === 'pickup' ? 'pickup' : 'delivery'
  const out: string[] = []

  const days = describeDays(schedule.availableDays)
  if (days) out.push(`${word} available ${days}.`)

  if (schedule.cutoffTime) {
    out.push(
      `Orders placed after ${describeTime(schedule.cutoffTime)} are treated as next-day orders.`,
    )
  }

  const delay = asNumber(schedule.minDaysDelay, 0)
  if (delay <= 0) {
    out.push(`Same-day ${lower} may be available.`)
  } else if (delay === 1) {
    out.push(`Earliest ${lower} is the next trading day.`)
  } else {
    out.push(`Earliest ${lower} is ${delay} trading days away.`)
  }

  if (schedule.excludedDates?.length) {
    out.push(`Some dates are unavailable.`)
  }

  return out
}

/* ------------------------------------------------------------------ *
 * Next available date (only used when the schedule sets requireDate)
 * ------------------------------------------------------------------ */

const DAY_MS = 86_400_000

/** "YYYY-MM-DD" and "HH:mm" for `now` in the given IANA timezone. */
function localParts(now: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts: Record<string, string> = {}
  for (const p of fmt.formatToParts(now)) parts[p.type] = p.value
  const hour = parts.hour === '24' ? '00' : parts.hour
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(hour) * 60 + Number(parts.minute),
  }
}

function isoAddDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) + days * DAY_MS
  return new Date(t).toISOString().slice(0, 10)
}

function isoWeekday(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  // 0 = Sunday from getUTCDay; WEEK is Monday-first.
  return WEEK[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7]
}

/**
 * The earliest date the supplier could fulfil this order, honouring the schedule's
 * available days, `minDaysDelay`, cut-off time and excluded dates, plus the largest
 * `minDeliveryDays` across the cart. Returns "YYYY-MM-DD", or null if nothing in the
 * next 120 days qualifies. Only display this when `schedule.requireDate` is true.
 */
export function nextAvailableDate(
  schedule: Schedule | null,
  extraLeadDays = 0,
  now: Date = new Date(),
): string | null {
  if (!schedule) return null
  const tz = schedule.timezone || 'Australia/Perth'
  let today: string
  let minutesNow: number
  try {
    const parts = localParts(now, tz)
    today = parts.date
    minutesNow = parts.minutes
  } catch {
    const parts = localParts(now, 'UTC')
    today = parts.date
    minutesNow = parts.minutes
  }

  let lead = Math.max(asNumber(schedule.minDaysDelay, 0), extraLeadDays, 0)
  if (schedule.cutoffTime) {
    const m = /^(\d{1,2}):(\d{2})/.exec(schedule.cutoffTime)
    if (m && minutesNow >= Number(m[1]) * 60 + Number(m[2])) lead += 1
  }

  const excluded = new Set(asArray(schedule.excludedDates))
  const available = new Set(
    asArray(schedule.availableDays).map((d) => d.toLowerCase()),
  )
  for (let i = 0; i <= 120; i++) {
    const iso = isoAddDays(today, lead + i)
    if (available.size > 0 && !available.has(isoWeekday(iso))) continue
    if (excluded.has(iso)) continue
    return iso
  }
  return null
}

/** "YYYY-MM-DD" → "Thursday 24 September 2026". */
export function formatIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/* ------------------------------------------------------------------ *
 * Cart maths
 * ------------------------------------------------------------------ */

/** Total option fees on a line, in cents. */
export function optionFeesCents(line: CartLine) {
  return line.optionsSelected.reduce((n, o) => n + (o.feeAmountCents ?? 0), 0)
}

/** Unit price the shopper pays for this line: product price + option fees. */
export function unitPriceCents(line: CartLine, product: Product) {
  return product.priceCents + optionFeesCents(line)
}

/** The `items` payload for POST /promo-code. */
export function promoItems(
  lines: CartLine[],
  byId: Map<string, Product>,
): {
  productId: string
  customerPriceCents: number
  quantity: number
  chargeGST: boolean
  categoryIds: string[]
}[] {
  const items = []
  for (const line of lines) {
    const product = byId.get(line.productId)
    if (!product) continue
    items.push({
      productId: product.id,
      customerPriceCents: unitPriceCents(line, product),
      quantity: line.quantity,
      chargeGST: product.chargeGst,
      categoryIds: product.categoryIds,
    })
  }
  return items
}

/**
 * Pull a cents saving out of the API's `cartDiscount` object.
 *
 * The shape is undocumented and we have never seen a populated one from this
 * supplier (every code we can test returns `cartDiscount: null`), so this reads it
 * defensively: look for a plausible `…Cents` number, preferring GST-inclusive and
 * discount-named keys, one level deep. Returns null when nothing is recognisable —
 * callers then tell the shopper the discount is applied at checkout.
 */
export function discountCentsFrom(
  cartDiscount: Record<string, unknown> | null | undefined,
): number | null {
  if (!cartDiscount || typeof cartDiscount !== 'object') return null

  const preferred = [
    'discountincgstcents',
    'cartdiscountincgstcents',
    'totaldiscountincgstcents',
    'discountcents',
    'cartdiscountcents',
    'totaldiscountcents',
    'savingcents',
    'savingsincgstcents',
    'amountincgstcents',
    'amountcents',
    'valuecents',
  ]

  const found = new Map<string, number>()
  const scan = (obj: Record<string, unknown>, depth: number) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        if (!found.has(key.toLowerCase())) found.set(key.toLowerCase(), value)
      } else if (
        depth < 2 &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        scan(value as Record<string, unknown>, depth + 1)
      }
    }
  }
  scan(cartDiscount, 0)

  for (const key of preferred) {
    const value = found.get(key)
    if (value) return Math.round(value)
  }
  // Anything else that looks like a cents amount for a discount/saving.
  const generic = [...found.entries()].filter(
    ([key]) =>
      key.endsWith('cents') &&
      /discount|saving|amount|total|value/.test(key) &&
      !/min|threshold|shipping/.test(key),
  )
  const incGst = generic.find(([key]) => key.includes('incgst'))
  const pick = incGst ?? (generic.length > 0 ? generic[0] : undefined)
  return pick ? Math.round(pick[1]) : null
}

/* ------------------------------------------------------------------ *
 * Pre-checkout reconciliation
 * ------------------------------------------------------------------ */

export type CartChange =
  | { kind: 'removed'; key: string; name: string }
  | { kind: 'out-of-stock'; key: string; name: string }
  | {
      kind: 'price'
      key: string
      name: string
      fromCents: number
      toCents: number
    }

export type Reconciliation = {
  /** What changed since the cart was last rendered. */
  changes: CartChange[]
  /** True when at least one line can no longer be bought — checkout must stop. */
  unavailable: boolean
  /** Fresh product list, to replace what the page is rendering. */
  products: Product[]
}

/**
 * Compares the cart against a freshly fetched product list. Callers should render
 * `changes`, swap in `products`, and refuse to check out while `unavailable`.
 */
export function reconcile(
  lines: CartLine[],
  freshProducts: Product[],
  previous: Map<string, Product>,
): Reconciliation {
  const fresh = new Map(freshProducts.map((p) => [p.id, p]))
  const changes: CartChange[] = []
  let unavailable = false

  for (const line of lines) {
    const before = previous.get(line.productId)
    const after = fresh.get(line.productId)
    const name = after?.name ?? before?.name ?? 'An item in your cart'
    if (!after) {
      changes.push({ kind: 'removed', key: line.key, name })
      unavailable = true
      continue
    }
    if (!after.inStock || after.stockStatus === 'out-of-stock') {
      changes.push({ kind: 'out-of-stock', key: line.key, name })
      unavailable = true
      continue
    }
    if (before && before.priceCents !== after.priceCents) {
      changes.push({
        kind: 'price',
        key: line.key,
        name,
        fromCents: before.priceCents,
        toCents: after.priceCents,
      })
    }
  }

  return { changes, unavailable, products: freshProducts }
}

/* ------------------------------------------------------------------ *
 * Errors
 * ------------------------------------------------------------------ */

/**
 * A real, diagnosable reason the checkout hand-off failed — never a blanket
 * "something went wrong" (see the storefront guide §8 A7). Callers should also
 * `console.error` the original error.
 */
export function checkoutErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 422 || err.status === 400) {
      return `${err.message} Please review the items in your cart and try again.`
    }
    return err.message
  }
  if (isNetworkError(err)) return BLOCKER_HINT
  return 'The checkout could not be started. Please try again in a moment.'
}

/* ------------------------------------------------------------------ *
 * Misc
 * ------------------------------------------------------------------ */

/** Largest `minDeliveryDays` across the cart, or 0 when nothing needs notice. */
export function maxNoticeDays(
  lines: CartLine[],
  byId: Map<string, Product>,
): number {
  let max = 0
  for (const line of lines) {
    const days = byId.get(line.productId)?.minDeliveryDays
    if (days && days > max) max = days
  }
  return max
}

/** The pickup/delivery schedule that applies to the chosen fulfilment method. */
export function scheduleFor(store: Store, fulfilment: Fulfilment | null) {
  return fulfilment === 'delivery'
    ? store.checkout.deliverySchedule
    : store.checkout.pickupSchedule
}
