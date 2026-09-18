import { useId, useState } from 'react'
import { Ornament } from '#/components/ui'
import { site } from '#/data/site'
import { contactSubjects, sendContactEnquiry } from '#/server/contact'

/**
 * Enquiry form. Native browser validation does the first pass (so the `required`
 * attributes are the single source of truth), then the server function is called
 * and the result drives one of three states: idle, sent, or "couldn't send".
 *
 * Typed values live in React state so an error never loses what someone wrote.
 */

type Status = 'idle' | 'pending' | 'error'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  company: '',
}

/** Gold hairline on ivory, green ring on focus — the heritage frame at input scale. */
const fieldClass =
  'w-full border border-gold-soft bg-ivory px-4 py-3 font-body text-[1.02rem] text-ink placeholder:text-ink-soft/60 transition-colors outline-none focus:border-green focus:ring-1 focus:ring-green'

const labelClass =
  'mb-2 block font-body text-[0.72rem] font-medium uppercase tracking-[0.22em] text-green'

/** Chevron for the select, which has its native arrow removed for consistency. */
const selectChevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='%23004d3f' d='M0 0h12L6 8z'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '12px 8px',
}

export function ContactForm() {
  const id = useId()
  const [values, setValues] = useState(EMPTY)
  const [status, setStatus] = useState<Status>('idle')
  const [sent, setSent] = useState(false)

  function set(field: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    if (status === 'error') setStatus('idle')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'pending') return
    setStatus('pending')
    try {
      const result = await sendContactEnquiry({ data: values })
      if (result.ok) {
        setSent(true)
        setStatus('idle')
      } else {
        setStatus('error')
      }
    } catch {
      // Network failure, cold start, anything else — same calm message.
      setStatus('error')
    }
  }

  if (sent) {
    return (
      <div className="frame-card px-6 py-12 text-center sm:px-10">
        <Ornament />
        <h3 className="mt-2 text-[1.8rem] text-green">Grazie, message sent.</h3>
        <p className="mx-auto mt-4 max-w-[38ch] text-ink-soft">
          Thank you for getting in touch. We read every enquiry and will come
          back to you as soon as we can.
        </p>
        <p className="mx-auto mt-4 max-w-[38ch] text-ink-soft">
          If it is urgent, the shop is the fastest way to reach us:
        </p>
        <p className="mt-3 font-display text-[1.9rem] text-green">
          <a href={site.phone.href} className="hover:text-red">
            {site.phone.display}
          </a>
        </p>
        <Ornament />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false}>
      {/* Honeypot. Hidden from people and assistive tech; bots fill it in. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        style={{ left: '-9999px' }}
      >
        <label htmlFor={`${id}-company`}>Company</label>
        <input
          id={`${id}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => set('company', e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${id}-name`}>
            Full name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${id}-email`}>
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${id}-phone`}>
            Phone
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={fieldClass}
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${id}-subject`}>
            Subject
          </label>
          <select
            id={`${id}-subject`}
            name="subject"
            required
            className={`${fieldClass} appearance-none pr-10`}
            style={selectChevron}
            value={values.subject}
            onChange={(e) => set('subject', e.target.value)}
          >
            <option value="" disabled>
              Please choose…
            </option>
            {contactSubjects.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${id}-message`}>
            Your enquiry{' '}
            <span className="text-ink-soft normal-case tracking-normal italic">
              (optional)
            </span>
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={6}
            className={`${fieldClass} resize-y`}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="submit"
          className="btn btn-solid disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === 'pending'}
        >
          {status === 'pending' ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className="text-[0.95rem] text-ink-soft italic">
          We reply by email or phone — never a mailing list.
        </p>
      </div>

      <div aria-live="polite" className="mt-5">
        {status === 'error' ? (
          <p className="border border-red/40 bg-ivory px-5 py-4 text-[1rem] text-ink">
            <span className="font-medium text-red">
              Sorry — that message could not be sent.
            </span>{' '}
            Nothing you typed has been lost, so please try again in a moment. If
            it keeps happening, the quickest way to reach us is to call the shop
            on{' '}
            <a href={site.phone.href} className="link-gold whitespace-nowrap">
              {site.phone.display}
            </a>
            .
          </p>
        ) : null}
        {status === 'pending' ? (
          <p className="sr-only">Sending your enquiry…</p>
        ) : null}
      </div>
    </form>
  )
}
