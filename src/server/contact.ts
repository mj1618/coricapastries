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
}

export type ContactResult =
  | { ok: true }
  /**
   * `invalid`        — required field missing or malformed email (the browser
   *                    normally catches this first; this is the server backstop).
   * `not-configured` — no RESEND_API_KEY on this deployment.
   * `send-failed`    — Resend rejected the request or the network failed.
   * The UI treats all three the same way: "please call the shop".
   */
  | { ok: false; reason: 'invalid' | 'not-configured' | 'send-failed' }

/**
 * Where enquiries land unless CONTACT_TO_EMAIL overrides it.
 * The sender has to be on a domain verified in the Resend account (the
 * SupplyWise one), so it is a supplywise.com.au address; replies go to the
 * shopper because of `reply_to`.
 */
const DEFAULT_TO = 'info@coricapastries.com.au'
const DEFAULT_FROM = 'Corica Pastries Website <noreply@supplywise.com.au>'

/** Deliberately loose: just enough to catch a typo, never enough to reject a real address. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
