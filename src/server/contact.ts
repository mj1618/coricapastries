import { createServerFn } from '@tanstack/react-start'

/**
 * Contact form back end.
 *
 * Everything that touches secrets (process.env) or the Resend API lives inside
 * `.handler()`, which the TanStack Start plugin strips from the client bundle.
 * The validator above it is pure string handling, so it is safe either side.
 *
 * Delivery is a plain `fetch` to the Resend REST API — no SDK dependency, which
 * keeps the "no build-step baggage" rule of this project intact. See .env.example.
 */

const SUBJECTS = [
  'General enquiry',
  'Custom cake or special occasion',
  'Wholesale',
  'Something else',
] as const

export type ContactSubject = (typeof SUBJECTS)[number]

export type ContactInput = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  /** Honeypot. Real people never see it, so it must arrive empty. */
  company: string
  /**
   * Epoch ms when the form was rendered. People take a while to fill a form
   * in; scripted submissions arrive within a second of the page loading.
   * Forgeable by anyone who reads this code, so it only catches generic bots;
   * Turnstile is the real gate.
   */
  startedAt: number
  /** Cloudflare Turnstile response token (empty when the widget is not set up). */
  turnstileToken: string
}

export type ContactResult =
  | { ok: true }
  /**
   * `invalid`        — required field missing or malformed email (the browser
   *                    normally catches this first; this is the server backstop).
   * `too-fast`       — submitted within MIN_FILL_MS of the form rendering.
   * `challenge`      — Turnstile token missing, expired or rejected.
   * `not-configured` — no RESEND_API_KEY on this deployment.
   * `send-failed`    — Resend rejected the request or the network failed.
   * The UI shows the same "please try again / call the shop" message for all of
   * them; the reason is for logs and tests.
   */
  | {
      ok: false
      reason:
        'invalid' | 'too-fast' | 'challenge' | 'not-configured' | 'send-failed'
    }

/**
 * Where enquiries land unless CONTACT_TO_EMAIL overrides it.
 * The sender has to be on a domain verified in the Resend account (the
 * SupplyWise one), so it is a supplywise.com.au address; replies go to the
 * shopper because of `reply_to`.
 */
const DEFAULT_TO = 'enquiries@corica.com.au'
const DEFAULT_FROM = 'Corica Pastries Website <noreply@supplywise.com.au>'

/** Deliberately loose: just enough to catch a typo, never enough to reject a real address. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Fastest plausible human fill: four required fields plus a click. Browser
 * autofill can get close, so keep this low; a person who trips it just sees the
 * "try again" message and their second attempt is later by definition.
 */
const MIN_FILL_MS = 3000

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

function trimmed(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/**
 * Input validator. Type-checks and trims only — it never throws, so a malformed
 * or hand-crafted POST lands in the handler and comes back as a tidy
 * `{ ok: false }` instead of a stack trace on the client.
 */
function validateContactInput(input: unknown): ContactInput {
  const raw = (
    typeof input === 'object' && input !== null ? input : {}
  ) as Record<string, unknown>
  return {
    name: trimmed(raw.name, 120),
    email: trimmed(raw.email, 200),
    phone: trimmed(raw.phone, 60),
    subject: trimmed(raw.subject, 120),
    message: trimmed(raw.message, 5000),
    company: trimmed(raw.company, 120),
    startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : 0,
    turnstileToken: trimmed(raw.turnstileToken, 4096),
  }
}

/**
 * Asks Cloudflare whether the widget token is genuine. With no secret configured
 * (local dev, or before the Cloudflare site is created) verification is skipped
 * with a warning so the form keeps working; the honeypot and timing check still
 * apply. Tokens are single-use, so the client resets the widget after any failure.
 */
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn(
      '[contact] TURNSTILE_SECRET_KEY is not set — skipping bot check.',
    )
    return true
  }
  if (!token) return false
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const result = (await response.json()) as {
      success?: boolean
      'error-codes'?: string[]
    }
    if (!result.success) {
      console.warn(
        '[contact] Turnstile rejected the token:',
        result['error-codes'],
      )
    }
    return result.success === true
  } catch (error) {
    console.error('[contact] Could not reach Turnstile:', error)
    return false
  }
}

function buildEmail(data: ContactInput) {
  const subject = SUBJECTS.includes(data.subject as ContactSubject)
    ? data.subject
    : 'General enquiry'
  return {
    subject: `Website enquiry — ${subject} — ${data.name}`,
    text: [
      `Subject:  ${subject}`,
      `Name:     ${data.name}`,
      `Email:    ${data.email}`,
      `Phone:    ${data.phone}`,
      '',
      'Enquiry:',
      data.message || '(no message left)',
      '',
      '—',
      'Sent from the contact form on the Corica Pastries website.',
    ].join('\n'),
  }
}

export const sendContactEnquiry = createServerFn({ method: 'POST' })
  .validator(validateContactInput)
  .handler(async ({ data }): Promise<ContactResult> => {
    // Honeypot: report success so bots get no signal about what tripped them.
    if (data.company) return { ok: true }

    if (!data.name || !data.email || !data.phone || !data.subject) {
      return { ok: false, reason: 'invalid' }
    }
    if (!EMAIL_RE.test(data.email)) {
      return { ok: false, reason: 'invalid' }
    }

    // A startedAt in the future or missing altogether is as suspicious as a
    // fast one: the form always sends it.
    const elapsed = Date.now() - data.startedAt
    if (!data.startedAt || elapsed < MIN_FILL_MS) {
      console.warn(`[contact] Rejected a submission ${elapsed}ms after render.`)
      return { ok: false, reason: 'too-fast' }
    }

    if (!(await verifyTurnstile(data.turnstileToken))) {
      return { ok: false, reason: 'challenge' }
    }

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO
    const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM

    if (!apiKey) {
      console.warn(
        '[contact] RESEND_API_KEY is not set — enquiry was not delivered. See .env.example.',
      )
      return { ok: false, reason: 'not-configured' }
    }

    const { subject, text } = buildEmail(data)

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: data.email,
          subject,
          text,
        }),
      })

      if (!response.ok) {
        // Body is logged for the operator only; the client just sees `send-failed`.
        const detail = await response.text().catch(() => '')
        console.error(
          `[contact] Resend responded ${response.status}: ${detail.slice(0, 500)}`,
        )
        return { ok: false, reason: 'send-failed' }
      }

      return { ok: true }
    } catch (error) {
      console.error('[contact] Could not reach Resend:', error)
      return { ok: false, reason: 'send-failed' }
    }
  })

export const contactSubjects: ReadonlyArray<ContactSubject> = SUBJECTS
