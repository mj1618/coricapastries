// Shapes returned by the SupplyWise Retail Storefront API. Prices are integer cents (AUD).

export type Tag = { name: string; color: string }

export type Product = {
  id: string
  name: string
  slug: string | null
  sku: string | null
  description: string | null
  priceCents: number
  basePriceCents: number | null
  onSale: boolean
  chargeGst: boolean
  weightGrams: number | null
  stockStatus: 'in-stock' | 'out-of-stock'
  inStock: boolean
  stockLevel: number | null
  subscribable: boolean
  allowFractionalQuantities: boolean
  minDeliveryDays: number | null
  sortIndex: number
  createdAt: number
  categoryIds: string[]
  filterValueIds: string[]
  tags: Tag[]
  images: string[]
  image: string | null
}

export type Category = {
  id: string
  name: string
  description: string | null
  sortIndex: number
  images: string[]
  image: string | null
}

export type VariantGroup = {
  id: string
  name: string
  slug: string | null
  description: string | null
  selectionLabel: string | null
  subscribable: boolean
  images: string[]
  image: string | null
  products: { productId: string; displayName: string }[]
}

export type Filter = {
  id: string
  name: string
  sortIndex: number
  values: { id: string; name: string; sortIndex: number }[]
}

export type ProductOption = {
  id: string
  name: string
  description: string | null
  selectionLabel: string | null
  type: 'select' | 'custom_text'
  values: { name: string; feeAmountCents: number }[]
  productIds: string[]
}

export type ShippingProfile = {
  id: string
  name: string
  description: string | null
  shippingType:
    'normal' | 'auspost' | 'weight-based' | 'amount-based' | 'pickup-only'
  flatPriceCents: number | null
  minOrderAmountCents: number | null
  minOrderAmountDeliveryCents: number | null
  minOrderAmountPickupCents: number | null
  freeShippingThresholdCents: number | null
  allowPickup: boolean
  allowDeliverWithExistingOrder: boolean
}

export type Schedule = {
  availableDays: string[]
  minDaysDelay: number
  cutoffTime?: string
  excludedDates?: string[]
  timezone?: string
  requireDate?: boolean
}

export type Supplier = {
  slug: string
  name: string
  businessName: string | null
  description: string | null
  abn: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: {
    addressLine1: string
    addressLine2: string
    suburb: string
    state: string
    postcode: string
    country: string
  } | null
  images: string[]
  image: string | null
}

export type Store = {
  supplier: Supplier
  categories: Category[]
  products: Product[]
  parents: VariantGroup[]
  options: ProductOption[]
  filters: Filter[]
  shipping: ShippingProfile | null
  checkout: {
    deliverySchedule: Schedule | null
    pickupSchedule: Schedule | null
    enableDeliveryDateSelection: boolean
    enablePickupDateSelection: boolean
    beforeOrderNotification: string | null
  }
}

export type ProductDetail = {
  product: Product
  options: ProductOption[]
  variantGroup: VariantGroup | null
  recommendedProductIds: string[]
}

export type ParentDetail = {
  parent: VariantGroup
  products: (Product & { displayName: string })[]
  options: ProductOption[]
  recommendedProductIds: string[]
}

export type OptionSelected = {
  productOptionId: string
  name: string
  value: string
  feeAmountCents?: number
}

export type SubscriptionFrequency = 'weekly' | 'fortnightly' | 'monthly'

/** One cart line, stored exactly in the shape POST /checkout expects (plus a key). */
export type CartLine = {
  key: string
  productId: string
  quantity: number
  optionsSelected: OptionSelected[]
  subscriptionFrequency?: SubscriptionFrequency
}

export type PromoResult = {
  promoCode: string
  status: 'applied' | 'invalid' | 'none' | string
  error: string | null
  cartDiscount: Record<string, unknown> | null
  productDiscountIds: string[]
}

export type CheckoutResult = { token: string; checkoutUrl: string }

export type OrderSummary = {
  id: string
  orderReference: string | null
  invoiceReference: string | null
  orderStatus: string
  paymentStatus: string
  shippingStatus: string
  createdAt: number
  pickupOrDelivery: 'pickup' | 'delivery' | null
  deliveryDate: string | null
  totalIncGstCents: number
  totalExcGstCents: number
}

export type Order = OrderSummary & {
  tracking: {
    trackingNumber: string | null
    trackingUrl: string | null
    parcels: { trackingNumber: string | null; trackingUrl: string | null }[]
  } | null
  totals: {
    itemsExcGstCents: number
    itemsIncGstCents: number
    shippingExcGstCents: number
    shippingIncGstCents: number
    lineDiscountIncGstCents: number
    cartDiscountIncGstCents: number
    creditNotesIncGstCents: number
    gstCents: number
    totalExcGstCents: number
    totalIncGstCents: number
    promoCodeApplied: string | null
  }
  shippingAddress: Record<string, string> | null
  items: {
    productId: string
    name: string
    sku: string | null
    quantity: number
    unitPriceCents: number
    chargeGst: boolean
    optionsSelected: { name: string; value: string; feeAmountCents?: number }[]
    images: string[]
    image: string | null
  }[]
}

export type Subscription = {
  id: string
  status: 'active' | 'paused'
  frequency: SubscriptionFrequency
  nextOrderDate: string
  pickupOrDelivery: 'pickup' | 'delivery'
  shippingAddress: Record<string, string> | null
  items: {
    productId: string
    name: string
    quantity: number
    priceCents: number
    optionsSelected: { name: string; value: string; feeAmountCents?: number }[]
  }[]
}

export type Tokens = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}
