import { useEffect, useRef, useState } from 'react'

// Christmas opening hours notice. Stops showing after the last day on the poster
// (Mon 4 Jan 2027, Perth time), so it never needs removing by hand.
const popupImage = '/img/christmas-hours.png'
const popupAlt =
  'Christmas opening hours. Mon 21st to Wed 23rd Dec 8am to 5.30pm. Thu 24th Dec 8am to 4pm. Closed Christmas Day 25th to Mon 28th Dec. Tue 29th and Wed 30th Dec 8am to 5.30pm. Thu 31st Dec 8am to 4pm. Closed New Years Day. Sat 2nd Jan 8am to 3pm. Closed Sun 3rd Jan. Normal trading resumes Mon 4th Jan.'
const showUntil = new Date('2027-01-05T00:00:00+08:00')
const seenKey = 'corica-welcome-popup-seen'

/** Shows the notice once per visit, on whichever page the customer lands on. */
export function WelcomePopup() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (Date.now() >= showUntil.getTime()) return
    try {
      if (sessionStorage.getItem(seenKey)) return
      sessionStorage.setItem(seenKey, '1')
    } catch {
      // Storage blocked: just show it.
    }
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Christmas opening hours"
        className="relative max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={popupImage}
          alt={popupAlt}
          width={1080}
          height={1350}
          className="block h-auto max-h-[90vh] w-auto max-w-full bg-white shadow-2xl"
        />
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-green text-2xl leading-none text-cream shadow-md hover:bg-green-deep"
        >
          ×
        </button>
      </div>
    </div>
  )
}
