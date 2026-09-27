import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const cookieConsentStorageKey = 'meskni.cookieConsent'

type CookieChoice = 'accepted' | 'essential-only'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(cookieConsentStorageKey)
    setVisible(!stored)
  }, [])

  function save(choice: CookieChoice) {
    localStorage.setItem(cookieConsentStorageKey, choice)
    setVisible(false)
  }

  if (!visible) {
    return null
  }

  return (
    <aside className="cookie-banner" aria-live="polite" aria-label="Cookie consent">
      <div className="cookie-banner-copy">
        <strong>We use cookies for essential site functionality and analytics.</strong>
        <p>
          We keep cookies to maintain your session and understand which pages help people find homes faster.
          Review our <Link to="/legal/cookie-policy">cookie policy</Link> before choosing.
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button className="button button-dark" type="button" onClick={() => save('accepted')}>
          Accept cookies
        </button>
        <button className="button button-quiet" type="button" onClick={() => save('essential-only')}>
          Only essential
        </button>
      </div>
    </aside>
  )
}
