import { sanitizeDescriptionHtml } from '#/lib/shop/sanitize'

/**
 * Supplier-authored description. The API returns it raw, so it goes through the
 * allowlist sanitizer (p, br, strong, em, h1 — every attribute stripped) before it is
 * inserted. Because attributes are stripped there is no class to hook onto, so the
 * typography is set here with child selectors.
 */
export function ProductDescription({
  html,
  className = '',
}: {
  html: string | null | undefined
  className?: string
}) {
  const clean = sanitizeDescriptionHtml(html)
  if (!clean) return null
  return (
    <div
      className={`text-[1.05rem] leading-relaxed text-pretty text-ink-soft [&_em]:italic [&_h1]:mt-4 [&_h1]:font-display [&_h1]:text-[1.4rem] [&_h1]:text-green [&_p]:mt-3 [&_p:first-child]:mt-0 [&_strong]:font-semibold [&_strong]:text-ink ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
