import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/** Gold hairline ornament with a small star, used under centred headings. */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`orn ${className}`} aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path d="M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </svg>
    </div>
  )
}

export function Eyebrow({
  children,
  green = false,
  className = '',
}: {
  children: ReactNode
  green?: boolean
  className?: string
}) {
  return (
    <div className={`eyebrow ${green ? 'eyebrow-green' : ''} ${className}`}>
      {children}
    </div>
  )
}

type ButtonVariant = 'outline' | 'solid' | 'gold' | 'cream'
const variantClass: Record<ButtonVariant, string> = {
  outline: '',
  solid: 'btn-solid',
  gold: 'btn-gold',
  cream: 'btn-cream',
}

/** Internal link styled as a button. Use <a className="btn"> for tel:/external links. */
export function ButtonLink({
  to,
  children,
  variant = 'outline',
  className = '',
  hash,
}: {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  className?: string
  hash?: string
}) {
  return (
    <Link
      to={to}
      hash={hash}
      className={`btn ${variantClass[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}

/**
 * Standard interior page header: deep green band, gold eyebrow, display title,
 * optional lede. Keeps every subpage opening the same way.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-green text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            'url(/img/logo-watermark.png) no-repeat right -120px center / 620px',
        }}
        aria-hidden="true"
      />
      <div className="wrap relative py-14 text-center md:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mx-auto mt-3 max-w-[18ch] text-[clamp(2.4rem,5vw,4rem)] font-normal text-cream">
          {title}
        </h1>
        {lede ? (
          <p className="mx-auto mt-4 max-w-[52ch] text-[1.2rem] italic text-cream/85">
            {lede}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  )
}
