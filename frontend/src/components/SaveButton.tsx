import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { saveListing, unsaveListing } from '../api/listings'
import { useAuth } from '../hooks/useAuth'

export function SaveButton({ listingId, initialSaved = false, onSavedChange }: { listingId: number; initialSaved?: boolean; onSavedChange?: (saved: boolean) => void }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = user?.role === 'seeker'

  async function toggleSaved() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (!canSave || loading) return
    setLoading(true)
    setError(null)
    try {
      if (saved) await unsaveListing(listingId)
      else await saveListing(listingId)
      setSaved(!saved)
      onSavedChange?.(!saved)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) navigate('/login', { state: { from: location } })
      else setError(requestError instanceof ApiError ? requestError.message : 'Unable to update saved listings.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="save-control"><button className={saved ? 'save-button saved' : 'save-button'} type="button" onClick={() => void toggleSaved()} disabled={loading || (isAuthenticated && !canSave)} aria-label={saved ? 'Remove from saved listings' : 'Save listing'} aria-pressed={saved}>{saved ? '♥' : '♡'}</button>{error && <span className="save-error" role="alert">{error}</span>}</div>
}