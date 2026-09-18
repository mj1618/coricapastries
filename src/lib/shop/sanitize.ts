// Supplier-authored descriptions may contain HTML. Match the SupplyWise store's
// allowlist (p, br, strong, em, h1), strip every attribute and comment.
const ALLOWED = new Set(['p', 'br', 'strong', 'em', 'h1'])

export function sanitizeDescriptionHtml(
  input: string | null | undefined,
): string {
  if (!input) return ''
  let out = input.replace(/<!--[\s\S]*?-->/g, '')
  out = out.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '')
  out = out.replace(/<\/?(script|style)\b[^>]*>/gi, '')
  out = out.replace(
    /<(\/)?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/)?>/g,
    (
      _m,
      close: string | undefined,
      name: string,
      selfClose: string | undefined,
    ) => {
      const tag = name.toLowerCase()
      if (!ALLOWED.has(tag)) return ''
      if (close) return `</${tag}>`
      if (tag === 'br' || selfClose) return `<${tag}/>`
      return `<${tag}>`
    },
  )
  // Drop empty paragraphs the supplier's editor leaves behind.
  return out.replace(/<p>\s*<\/p>/g, '').trim()
}

/** Plain-text version for meta descriptions and card excerpts. */
export function htmlToText(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h1|li|div)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
