import { useEffect, useState } from 'react'
import { ShopImage } from '#/components/shop/ShopImage'

/**
 * Detail-page gallery: the whole ordered `images` array, main image plus thumbnails
 * and prev/next. One image shows no thumbnails; none falls back to the ivory logo
 * tile. On a variant group the `images` prop follows the selected member, so the
 * index resets whenever the gallery changes.
 */
export function GalleryViewer({
  images,
  alt,
  badge,
}: {
  images: string[]
  alt: string
  badge?: React.ReactNode
}) {
  const [index, setIndex] = useState(0)
  const key = images.join('|')
  useEffect(() => setIndex(0), [key])

  const count = images.length
  const current = count > 0 ? images[Math.min(index, count - 1)] : null
  const step = (delta: number) => setIndex((i) => (i + delta + count) % count)

  return (
    <div>
      <div className="relative border border-gold-soft bg-ivory p-2 sm:p-3">
        <ShopImage
          src={current}
          alt={alt}
          priority
          sizes="(min-width: 1024px) 520px, 92vw"
        />
        {badge ? (
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
            {badge}
          </div>
        ) : null}

        {count > 1 ? (
          <>
            <GalleryArrow direction="previous" onClick={() => step(-1)} />
            <GalleryArrow direction="next" onClick={() => step(1)} />
            <p className="absolute right-4 bottom-4 bg-ivory/90 px-2 py-0.5 text-[0.7rem] text-ink-soft sm:right-5 sm:bottom-5">
              {Math.min(index, count - 1) + 1} / {count}
            </p>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {images.map((src, i) => {
            const active = i === Math.min(index, count - 1)
            return (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={active}
                  aria-label={`${alt} — image ${i + 1} of ${count}`}
                  className={`block w-[72px] border p-1 transition-colors ${
                    active
                      ? 'border-gold'
                      : 'border-gold-soft/70 hover:border-gold-soft'
                  }`}
                >
                  <ShopImage src={src} alt="" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
}) {
  const next = direction === 'next'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${next ? 'Next' : 'Previous'} image`}
      className={`absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border border-gold-soft bg-ivory/90 text-green transition-colors hover:border-gold hover:bg-ivory ${
        next ? 'right-4 sm:right-5' : 'left-4 sm:left-5'
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d={next ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
      </svg>
    </button>
  )
}
