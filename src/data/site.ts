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
  // Taken from the current site and unconfirmed by the owners.
  hours: [
    { days: 'Monday – Friday', time: '8am – 5:30pm' },
    { days: 'Saturday', time: '8am – 3pm' },
    { days: 'Sunday & Public Holidays', time: 'Closed' },
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
  siteUrl: 'https://corica-website.vercel.app',
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
