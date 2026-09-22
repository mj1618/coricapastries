// The only established facts about the business. Do not add history, awards,
// family names or product claims here that the owners have not confirmed.

/**
 * Google Tag Manager container carried over from the old WordPress site
 * (2026-09-22). It holds the GA4 property, Google Ads conversion tags and a
 * Facebook pixel, all managed in the GTM dashboard rather than here.
 */
export const gtmId = 'GTM-NKFF6BS'

/** Hostnames analytics may run on. Localhost and the vercel.app staging alias stay out of the data. */
export const analyticsHostPattern = /(^|\.)coricapastries\.com\.au$/

export const site = {
  name: 'Corica Pastries',
  legalName: 'Giuseppe Corica Pastries',
  established: 1957,
  founder: 'Giuseppe Corica',
  tagline: "Home of Perth's most famous apple strudel",
  address: {
    street: '106 Aberdeen Street',
    suburb: 'Northbridge',
    state: 'WA',
    postcode: '6003',
    // From the live FAQ: "the bright green building on the corner of Aberdeen Street and Lake Street".
    landmark: 'On the corner of Aberdeen Street and Lake Street',
  },
  phone: {
    display: '(08) 9328 8196',
    href: 'tel:+61893288196',
  },
  /** Approximate shop-front coordinates (OpenStreetMap, 2026-09-22) for local-business schema. */
  geo: { latitude: -31.94599, longitude: 115.85819 },
  // Taken from the current site and unconfirmed by the owners. `schema` is the
  // same information in machine form for the opening-hours structured data;
  // a closed day simply has no entry.
  hours: [
    {
      days: 'Monday – Friday',
      time: '8am – 5:30pm',
      schema: {
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:30',
      },
    },
    {
      days: 'Saturday',
      time: '8am – 3pm',
      schema: { dayOfWeek: ['Saturday'], opens: '08:00', closes: '15:00' },
    },
    { days: 'Sunday & Public Holidays', time: 'Closed', schema: null },
  ],
  hoursNote: 'Trading hours can differ over festive periods.',
  social: {
    facebook: 'https://www.facebook.com/CoricaPastries/',
    instagram: 'https://www.instagram.com/coricapastriesau/',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Corica+Pastries+106+Aberdeen+Street+Northbridge+WA+6003',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=106+Aberdeen+Street,+Northbridge+WA+6003&output=embed',
  /**
   * Canonical origin, no trailing slash. The old site lived on www and every
   * existing inbound link points there, so www stays the canonical host and
   * the apex redirects to it (Vercel domain settings). Until the domain moves,
   * the canonical tags on the vercel.app alias point here too, which is
   * exactly what a staging copy should say.
   */
  siteUrl: 'https://www.coricapastries.com.au',
} as const

export const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/patisserie', label: 'The Patisserie' },
  { to: '/shop', label: 'Shop' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact Us' },
] as const

export const fullAddress = `${site.address.street}, ${site.address.suburb} ${site.address.state} ${site.address.postcode}`
