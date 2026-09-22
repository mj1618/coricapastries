import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Cloudflare Turnstile, the bot check on the enquiry form.
 *
 * The widget runs as soon as it renders (`execution: 'render'`) and stays
 * invisible unless Cloudflare decides it needs the visitor to interact, so
 * most people never see it. The token it produces is single-use and lasts five
 * minutes; the widget refreshes expired ones itself, and `reset()` gets a fresh
 * one after a failed submission.
 *
 * With no VITE_TURNSTILE_SITE_KEY the hook is inert and `getToken()` resolves
 * to '' — the server then skips verification too (see server/contact.ts).
 */

export const TURNSTILE_SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** How long `getToken()` waits for a token that is still being generated. */
const TOKEN_WAIT_MS = 15_000

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: (code?: string) => void
      theme?: 'light' | 'dark' | 'auto'
      appearance?: 'always' | 'execute' | 'interaction-only'
      execution?: 'render' | 'execute'
      size?: 'normal' | 'flexible' | 'compact'
    },
  ) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null

/** Loads the Turnstile script once per page, however many forms mount. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile script loaded without window.turnstile'))
    }
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const token = useRef('')
  const waiters = useRef<Array<(token: string) => void>>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) return
    let cancelled = false
    const container = containerRef.current

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return
        widgetId.current = turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          appearance: 'interaction-only',
          execution: 'render',
          size: 'flexible',
          callback: (value) => {
            token.current = value
            setFailed(false)
            for (const resolve of waiters.current.splice(0)) resolve(value)
          },
          'expired-callback': () => {
            token.current = ''
          },
          'error-callback': () => {
            token.current = ''
            setFailed(true)
          },
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [])

  /**
   * The current token, or the next one if the widget is still working. Resolves
   * to '' after TOKEN_WAIT_MS so a stuck widget turns into the ordinary
   * "could not send" message rather than a spinner that never stops.
   */
  const getToken = useCallback((): Promise<string> => {
    if (!TURNSTILE_SITE_KEY) return Promise.resolve('')
    if (token.current) return Promise.resolve(token.current)
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        waiters.current = waiters.current.filter((w) => w !== settle)
        resolve('')
      }, TOKEN_WAIT_MS)
      const settle = (value: string) => {
        clearTimeout(timer)
        resolve(value)
      }
      waiters.current.push(settle)
    })
  }, [])

  /** Tokens are single-use: call this after every submission that did not succeed. */
  const reset = useCallback(() => {
    token.current = ''
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current)
    }
  }, [])

  return { containerRef, getToken, reset, failed }
}
