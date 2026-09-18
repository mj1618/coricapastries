// Bridges the brochure catalogue to the online shop.
//
// The categories in `src/data/catalogue.ts` were scraped from the old site; the
// shop's category keys come from the SupplyWise category names. Most slugs match,
// but two differ, so every `/shop?category=…` link on a brochure page goes through
// `shopCategory()` rather than reusing the catalogue slug directly.

/** Catalogue slug → the `?category=` key used by `/shop`. */
export const shopCategoryBySlug: Record<string, string> = {
  strudels: 'strudels',
  'birthday-cakes': 'birthday-cakes',
  'special-occasions': 'special-occasion',
  'mini-range': 'mini-range',
  'small-pastries': 'small-pastries',
  biscuits: 'biscuits',
  'gluten-free': 'gluten-free-range',
  christmas: 'christmas',
}

/**
 * The shop category key for a catalogue slug, or `undefined` when the range has
 * no matching shop category (so callers can fall back to linking all of /shop).
 */
export function shopCategory(slug: string): string | undefined {
  return shopCategoryBySlug[slug]
}
