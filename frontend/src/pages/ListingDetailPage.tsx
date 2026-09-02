import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { sendInquiry } from '../api/messages'
import { submitReport } from '../api/reports'
import { getListing, listingImageUrl } from '../api/listings'
import { SaveButton } from '../components/SaveButton'
import { useAuth } from '../hooks/useAuth'
import type { Listing } from '../types/listing'

function label(value: string) {
  return value.replaceAll('_', ' ')
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [listing, setListing] = useState<Listing | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiry, setInquiry] = useState('')
  const [inquiryState, setInquiryState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [inquiryError, setInquiryError] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<'scam' | 'misleading' | 'duplicate' | 'inappropriate' | 'other'>('scam')
  const [reportDetails, setReportDetails] = useState('')
  const [reportState, setReportState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [reportError, setReportError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    void getListing(id)
      .then(setListing)
      .catch((requestError: unknown) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load this listing right now.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="page-state">Loading listing...</main>
  if (error || !listing) return <main className="page-state"><div><p className="form-error" role="alert">{error ?? 'Listing not found.'}</p><Link className="button button-dark" to="/listings">Back to listings</Link></div></main>

  const images = listing.images ?? []
  const currentImage = images[activeImage]

  async function submitInquiry() {
    if (!listing) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (!inquiry.trim()) {
      setInquiryError('Write a message before sending.')
      return
    }
    setInquiryState('sending')
    setInquiryError(null)
    try {
      await sendInquiry(listing.id, inquiry.trim())
      setInquiry('')
      setInquiryState('sent')
    } catch (requestError) {
      setInquiryState('idle')
      setInquiryError(requestError instanceof ApiError ? requestError.message : 'Unable to send your inquiry.')
    }
  }

  async function reportListing() {
    if (!listing) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    setReportState('sending')
    setReportError(null)
    try {
      await submitReport(listing.id, reportReason, reportDetails.trim())
      setReportState('sent')
      setReportDetails('')
    } catch (requestError) {
      setReportState('idle')
      setReportError(requestError instanceof ApiError ? requestError.message : 'Unable to submit this report.')
    }
  }

  return (
    <main className="detail-page site-shell">
      <nav className="topbar" aria-label="Listing navigation"><Link className="brand" to="/">meskni</Link><div className="topbar-actions"><Link className="button button-quiet" to="/listings">Browse listings</Link><Link className="button button-quiet" to="/account">Account</Link></div></nav>
      <div className="detail-breadcrumb"><Link to="/listings">Listings</Link><span>/</span><span>{listing.city}</span><span>/</span><span>{listing.neighborhood}</span></div>
      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="gallery-main">{currentImage ? <img src={listingImageUrl(currentImage.path)} alt={`${listing.title} photo ${activeImage + 1}`} /> : <div className="gallery-empty">Photos coming soon</div>}</div>
          {images.length > 1 && <div className="gallery-thumbnails">{images.map((image, index) => <button className={index === activeImage ? 'thumbnail active' : 'thumbnail'} type="button" key={image.id} onClick={() => setActiveImage(index)}><img src={listingImageUrl(image.path)} alt={`View photo ${index + 1}`} /></button>)}</div>}
        </div>
        <aside className="detail-summary"><div className="detail-title-row"><p className="eyebrow">{label(listing.property_type)} · {label(listing.listing_type)}</p><SaveButton listingId={listing.id} /></div><h1>{listing.title}</h1><p className="detail-location">{listing.neighborhood}, {listing.city}</p><p className="detail-price">{listing.rent.toLocaleString()} <span>MAD / month</span></p><div className="detail-rule" /><div className="owner-line"><span className="owner-avatar" aria-hidden="true">{listing.owner?.name.charAt(0) ?? '?'}</span><div><small>Listed by</small><strong>{listing.owner?.name ?? 'Meskni owner'}</strong></div></div>{user?.id !== listing.owner_id && <div className="inquiry-box"><h2>Ask about this place</h2><textarea rows={4} value={inquiry} onChange={(event) => { setInquiry(event.target.value); setInquiryState('idle') }} placeholder="Ask about availability, move-in details, or the neighborhood." /><button className="button button-dark contact-button" type="button" onClick={() => void submitInquiry()} disabled={inquiryState === 'sending'}>{inquiryState === 'sending' ? 'Sending...' : isAuthenticated ? 'Contact owner' : 'Log in to contact'}</button>{inquiryState === 'sent' && <p className="form-success" role="status">Your inquiry was sent. Check Messages for replies.</p>}{inquiryError && <p className="form-error" role="alert">{inquiryError}</p>}</div>}</aside>
      </section>
      <section className="detail-information"><div className="detail-description"><p className="eyebrow">About this place</p><h2>A place with room to live.</h2><p>{listing.description}</p>{listing.address && <p className="address-line">{listing.address}</p>}</div><div className="detail-facts"><h2>At a glance</h2><div className="facts-grid"><span><strong>{listing.bedrooms}</strong> bedroom{listing.bedrooms === 1 ? '' : 's'}</span><span><strong>{listing.bathrooms}</strong> bathroom{listing.bathrooms === 1 ? '' : 's'}</span>{listing.surface_area && <span><strong>{listing.surface_area}</strong> m²</span>}<span><strong>{listing.available_spots}</strong> spot{listing.available_spots === 1 ? '' : 's'} available</span></div><div className="amenity-list">{listing.furnished && <span>Furnished</span>}{listing.internet_included && <span>Internet included</span>}{listing.parking && <span>Parking available</span>}<span>For {listing.gender_preference === 'any' ? 'everyone' : `${listing.gender_preference} tenants`}</span></div></div></section>
      {user?.id !== listing.owner_id && <section className="report-box"><div><p className="eyebrow">Help keep Meskni safe</p><h2>Something look wrong?</h2><p>Report scams, misleading details, or duplicate listings for review.</p></div><div className="report-form"><select value={reportReason} onChange={(event) => setReportReason(event.target.value as typeof reportReason)}><option value="scam">Possible scam</option><option value="misleading">Misleading information</option><option value="duplicate">Duplicate listing</option><option value="inappropriate">Inappropriate content</option><option value="other">Other</option></select><textarea rows={3} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Add context (optional)" /><button className="button button-quiet" type="button" onClick={() => void reportListing()} disabled={reportState === 'sending'}>{reportState === 'sending' ? 'Submitting...' : isAuthenticated ? 'Report listing' : 'Log in to report'}</button>{reportState === 'sent' && <p className="form-success" role="status">Report submitted for review.</p>}{reportError && <p className="form-error" role="alert">{reportError}</p>}</div></section>}
      <section className="availability-band"><div><p className="eyebrow">Move-in details</p><h2>Plan your next move.</h2></div><dl><div><dt>Available from</dt><dd>{listing.available_from ?? 'Contact owner'}</dd></div><div><dt>Deposit</dt><dd>{listing.deposit ? `${listing.deposit.toLocaleString()} MAD` : 'Not specified'}</dd></div><div><dt>Utilities</dt><dd>{listing.estimated_utilities ? `Around ${listing.estimated_utilities.toLocaleString()} MAD` : 'Not specified'}</dd></div></dl></section>
    </main>
  )
}