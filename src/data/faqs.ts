// Questions and answers reproduced from the live coricapastries.com.au FAQ page,
// lightly copy-edited for tone. Do not add answers the owners have not confirmed.
//
// Answer text may contain tokens that are filled in from `src/data/site.ts`, so the
// phone number, address and trading hours are never duplicated here:
//   {phone}    inline tel: link to site.phone
//   {address}  inline full street address
//   {hours}    a paragraph of its own, rendered as the trading-hours table
// Blank lines split an answer into paragraphs.

export type FaqItem = {
  /** Slug used for the accordion element id / deep links. */
  id: string
  q: string
  a: string
  /** Optional link rendered under the answer. */
  cta?: { to: string; label: string }
}

export type FaqGroup = {
  id: string
  group: string
  blurb: string
  items: FaqItem[]
}

export const faqs: FaqGroup[] = [
  {
    id: 'strudel',
    group: 'The apple strudel',
    blurb: 'Keeping it, serving it and travelling with it.',
    items: [
      {
        id: 'strudel-keeps',
        q: 'How long does the apple strudel last?',
        a: 'The apple strudel will last three days, but it must be kept refrigerated.',
      },
      {
        id: 'strudel-serves',
        q: 'How many people does the apple strudel feed?',
        a: 'A full strudel serves six to eight people. We also make a half strudel, which feeds four.',
        cta: { to: '/patisserie/strudels', label: 'See the strudel range' },
      },
      {
        id: 'strudel-halal',
        q: 'Is the apple strudel halal?',
        a: 'Yes. We do not use any pork products, animal meats or alcohol in our strudels.',
      },
      {
        id: 'strudel-gluten-dairy',
        q: 'Is the apple strudel gluten free or dairy free?',
        a: 'Unfortunately not — our strudels contain both dairy and gluten.',
        cta: {
          to: '/patisserie/gluten-free',
          label: 'See our gluten free range',
        },
      },
      {
        id: 'strudel-travel',
        q: 'Does the apple strudel travel well?',
        a: 'It is a great flying companion, as long as it is hand carried, kept upright and refrigerated before and after the flight.\n\nEach strudel comes in its own sturdy box. If you are buying several, you can also purchase a carry box or a reusable bag that fits six.',
      },
      {
        id: 'hotel-delivery',
        q: 'Do you deliver strudels to Perth hotels?',
        a: 'Yes, to major Perth hotels where possible. The minimum order is four full-sized strudels, there is no delivery fee, and the earliest delivery time is 10am.\n\nPlease make sure the hotel concierge will receive and refrigerate the order for you. Call us on {phone} to arrange a delivery.',
      },
    ],
  },
  {
    id: 'ordering',
    group: 'Ordering',
    blurb: 'Custom cakes, special requests and wholesale.',
    items: [
      {
        id: 'pre-order',
        q: 'How can I pre-order your products?',
        a: 'Orders are placed by phone or in store. Call us on {phone} and the shop team will talk your order through with you.',
      },
      {
        id: 'notice',
        q: 'How far in advance should I place my order?',
        a: 'It depends on the products and the quantity — the more notice you can give us, the better. Some products need 48 to 72 hours.\n\nIf something pops up unexpectedly, give us a ring anyway and we will do our best.',
      },
      {
        id: 'message-on-cake',
        q: 'Can I get a message written on my cake?',
        a: 'Yes, we can write a customised message on your cake. We usually have a cake decorator on at all times, though occasionally that person may be unavailable, for which we apologise.\n\nCall us on {phone} to discuss what you would like.',
      },
      {
        id: 'own-assortment',
        q: 'Can I create my own assortment of cakes?',
        a: 'Yes. We have a wide range of products in various sizes, so call us or visit the shop and we will help you put your own arrangement together.',
        cta: { to: '/patisserie', label: 'Browse the patisserie' },
      },
      {
        id: 'alcohol',
        q: 'Do your products contain alcohol?',
        a: 'Some do, such as our chocolate tartlets and tortas. If you order ahead you can request no alcohol and we will accommodate that where possible.',
      },
      {
        id: 'pregnancy',
        q: 'Are your products suitable for pregnant women?',
        a: 'Yes. Our custard, which contains eggs and dairy, is thoroughly cooked, and our dairy ingredients are pasteurised and purchased fresh daily.',
      },
      {
        id: 'wholesale',
        q: 'Do you offer wholesale?',
        a: 'Yes. Certain conditions must be met to be eligible for a 20% discount, so please call us on {phone} to discuss it.\n\nWe do not offer delivery on wholesale orders — all orders are collected from us in Northbridge.',
      },
      {
        id: 'home-delivery',
        q: 'Do you offer home delivery?',
        a: 'We do not deliver ourselves, but you can order from us on UberEats and DoorDash.',
      },
      {
        id: 'cant-find',
        q: "I can't find the product I want.",
        a: 'If you cannot find it on our website, or you would like to enquire about something special, contact us by phone or through the contact page and we will do our best to help.',
        cta: { to: '/contact', label: 'Contact the shop' },
      },
    ],
  },
  {
    id: 'visiting',
    group: 'Visiting us',
    blurb: 'Finding the shop, parking and trading hours.',
    items: [
      {
        id: 'location',
        q: 'Where are you located?',
        a: 'We are at {address}. Look for the bright green building on the corner of Aberdeen Street and Lake Street.',
        cta: { to: '/contact', label: 'Map and directions' },
      },
      {
        id: 'parking',
        q: 'Is there parking near you?',
        a: 'Yes, there is ample parking. There are five-minute bays right alongside us on Lake Street, paid parking just across the street, and more paid parking on Aberdeen Street.',
      },
      {
        id: 'hours',
        q: 'What are your trading hours?',
        a: '{hours}\n\nTrading hours can differ over festive periods, so please call us on {phone} if you are unsure.',
      },
    ],
  },
]
