import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getSavedListings } from '../api/listings'
import { SaveButton } from '../components/SaveButton'
import { useAuth } from '../hooks/useAuth'
import type { Listing } from '../types/listing'

export function SavedListingsPage() {
  const { user, status } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated' || user?.role !== 'seeker') return
    void getSavedListings()
      .then(setListings)
      .catch((requestError: unknown) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load saved listings.'))
      .finally(() => setLoading(false))
  }, [status, user?.role])

  if (status === 'loading') return <main className="page-state">Loading saved listings...</main>
  if (user?.role !== 'seeker') return <main className="page-state"><div><p className="form-error" role="alert">Saved listings are available to seekers.</p><Link className="button button-dark" to="/account">Back to account</Link></div></main>
  if (loading) return <main className="page-state">Loading saved listings...</main>

  return <main className="saved-page site-shell"><nav className="topbar" aria-label="Saved listings navigation"><Link className="brand" to="/">meskni</Link><div className="topbar-actions"><Link className="button button-quiet" to="/listings">Browse listings</Link><Link className="button button-quiet" to="/account">Account</Link></div></nav><header className="saved-header"><p className="eyebrow">Your shortlist</p><h1>Places worth keeping.</h1><p className="welcome-copy">Keep the listings that make you want to start planning.</p></header>{error && <p className="form-error" role="alert">{error}</p>}{!error && listings.length === 0 && <section className="saved-empty"><span className="empty-heart" aria-hidden="true">♡</span><h2>Your saved list is empty.</h2><p>When a place catches your eye, save it here for later.</p><Link className="button button-dark" to="/listings">Browse listings</Link></section>}<div className="saved-grid">{listings.map((listing) => <article className="saved-item" key={listing.id}><div className="listing-placeholder" aria-hidden="true"><span>{listing.property_type}</span></div><div className="saved-item-content"><div className="saved-item-top"><p className="listing-location">{listing.city} · {listing.neighborhood}</p><SaveButton listingId={listing.id} initialSaved onSavedChange={(saved) => { if (!saved) setListings((current) => current.filter((currentListing) => currentListing.id !== listing.id)) }} /></div><h2>{listing.title}</h2><p className="listing-summary">{listing.description}</p><p className="listing-price">{listing.rent.toLocaleString()} MAD / month</p><Link className="button button-quiet listing-link" to={`/listings/${listing.id}`}>View listing</Link></div></article>)}</div></main>
}