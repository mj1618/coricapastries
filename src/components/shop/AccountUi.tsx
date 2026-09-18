import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Eyebrow, Ornament } from '#/components/ui'
import { describeError } from '#/lib/shop/auth'

/** Shared furniture for the account pages: sections, badges, notices, skeletons. */

type ResourceState<T> = {
  status: 'loading' | 'ready' | 'error'
  data: T | null
  error: string | null
}

/**
 * Loads one `/account/*` resource in the browser. `load` must be a stable reference
 * (a module-level function). A 401 inside `accountFetch` has already logged the
 * shopper out by the time the error lands here.
 */
export function useAccountResource<T>(
  load: () => Promise<T>,
  fallbackMessage: string,
) {
  const [state, setState] = useState<ResourceState<T>>({
    status: 'loading',
    data: null,
    error: null,
  })
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    try {
      const data = await load()
      if (alive.current) setState({ status: 'ready', data, error: null })
    } catch (err) {
      if (alive.current) {
        setState({
          status: 'error',
          data: null,
          error: describeError(err, fallbackMessage),
        })
      }
    }
  }, [load, fallbackMessage])

  useEffect(() => {
    void reload()
  }, [reload])

  return { ...state, reload }
}

export function AccountSection({
  id,
  eyebrow,
  title,
  lede,
  action,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  lede?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-gold-soft pt-12">
      <div className="text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-[clamp(1.7rem,3.2vw,2.3rem)]">{title}</h2>
        {lede ? (
          <p className="mx-auto mt-2 max-w-[52ch] text-ink-soft italic">
            {lede}
          </p>
        ) : null}
        <Ornament />
        {action ? <div className="mb-2">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Neutral message inside a hairline frame — used for empty and error states. */
export function AccountNotice({
  tone = 'quiet',
  children,
}: {
  tone?: 'quiet' | 'warning'
  children: ReactNode
}) {
  const toneClass =
    tone === 'warning'
      ? 'border-red/40 bg-red/5 text-ink'
      : 'border-gold-soft bg-ivory text-ink-soft'
  return (
    <div
      className={`border px-6 py-6 text-center ${toneClass}`}
      role={tone === 'warning' ? 'alert' : undefined}
    >
      {children}
    </div>
  )
}

const BADGE_TONES: Record<string, string> = {
  paid: 'border-green/40 bg-green-soft text-green',
  delivered: 'border-green/40 bg-green-soft text-green',
  'pickup-completed': 'border-green/40 bg-green-soft text-green',
  shipped: 'border-green/40 bg-green-soft text-green',
  active: 'border-green/40 bg-green-soft text-green',
  unpaid: 'border-red/40 bg-red/5 text-red',
  cancelled: 'border-red/40 bg-red/5 text-red',
  voided: 'border-red/40 bg-red/5 text-red',
  refunded: 'border-red/40 bg-red/5 text-red',
}

/** Small status pill. Unknown statuses fall back to a neutral gold hairline. */
export function AccountBadge({
  label,
  status,
}: {
  label?: string
  status: string | null | undefined
}) {
  if (!status) return null
  const tone =
    BADGE_TONES[status.toLowerCase()] ??
    'border-gold-soft bg-cream text-ink-soft'
  return (
    <span
      className={`inline-flex items-center gap-1 border px-3 py-1 text-[0.7rem] tracking-[0.18em] uppercase ${tone}`}
    >
      {label ? <span className="opacity-70">{label}</span> : null}
      {humanise(status)}
    </span>
  )
}

export function humanise(value: string) {
  return value.replace(/[-_]/g, ' ')
}

/**
 * Defensive read of an API string. The types describe what the guide documents, but a
 * live response can still omit a field, so anything we print goes through here.
 */
export function optionalText(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

/** Neutral placeholder shown while auth state (client-only) settles. */
export function AccountSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border border-gold-soft bg-ivory" />
      ))}
    </div>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** ms epoch → "3 September 2026". */
export function formatTimestamp(ms: number | null | undefined) {
  if (!ms && ms !== 0) return null
  const date = new Date(ms)
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date)
}

/** "YYYY-MM-DD" → "3 September 2026" (kept as plain text if it does not parse). */
export function formatDay(value: string | null | undefined) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date)
}
