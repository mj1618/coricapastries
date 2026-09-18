/**
 * Product photography from SupplyWise, with a graceful fallback. Several products have
 * no photo yet, and a photo can also fail to load, so instead of a broken image we show
 * an ivory tile with a muted Corica logo. Images are arbitrary sizes upstream, so every
 * one sits in a square `object-cover` box.
 */
import { useEffect, useState } from 'react'

export function ShopImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  sizes?: string
  /** The main image on a detail page: load it eagerly, everything else is lazy. */
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  if (!src || failed) return <ShopImageFallback className={className} />

  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      width={800}
      height={800}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`aspect-square w-full bg-white object-cover ${className}`}
    />
  )
}

export function ShopImageFallback({ className = '' }: { className?: string }) {
  return (
    <div
      className={`grid aspect-square w-full place-items-center bg-ivory ${className}`}
      aria-hidden="true"
    >
      <img
        src="/img/logo.png"
        alt=""
        width={160}
        height={160}
        loading="lazy"
        decoding="async"
        className="w-[42%] max-w-[120px] opacity-20 mix-blend-multiply"
      />
    </div>
  )
}
