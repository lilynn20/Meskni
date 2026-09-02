import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getListing, listingImageUrl } from '../api/listings'
import { SaveButton } from '../components/SaveButton'
import type { Listing } from '../types/listing'

function label(value: string) {
  return value.replaceAll('_', ' ')
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <main className="detail-page site-shell">
      <nav className="topbar" aria-label="Listing navigation"><Link className="brand" to="/">meskni</Link><div className="topbar-actions"><Link className="button button-quiet" to="/listings">Browse listings</Link><Link className="button button-quiet" to="/account">Account</Link></div></nav>
      <div className="detail-breadcrumb"><Link to="/listings">Listings</Link><span>/</span><span>{listing.city}</span><span>/</span><span>{listing.neighborhood}</span></div>
      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="gallery-main">{currentImage ? <img src={listingImageUrl(currentImage.path)} alt={`${listing.title} photo ${activeImage + 1}`} /> : <div className="gallery-empty">Photos coming soon</div>}</div>
          {images.length > 1 && <div className="gallery-thumbnails">{images.map((image, index) => <button className={index === activeImage ? 'thumbnail active' : 'thumbnail'} type="button" key={image.id} onClick={() => setActiveImage(index)}><img src={listingImageUrl(image.path)} alt={`View photo ${index + 1}`} /></button>)}</div>}
        </div>
        <aside className="detail-summary"><div className="detail-title-row"><p className="eyebrow">{label(listing.property_type)} · {label(listing.listing_type)}</p><SaveButton listingId={listing.id} /></div><h1>{listing.title}</h1><p className="detail-location">{listing.neighborhood}, {listing.city}</p><p className="detail-price">{listing.rent.toLocaleString()} <span>MAD / month</span></p><div className="detail-rule" /><div className="owner-line"><span className="owner-avatar" aria-hidden="true">{listing.owner?.name.charAt(0) ?? '?'}</span><div><small>Listed by</small><strong>{listing.owner?.name ?? 'Meskni owner'}</strong></div></div><button className="button button-dark contact-button" type="button" disabled>Contact owner <small>Coming next</small></button></aside>
      </section>
      <section className="detail-information"><div className="detail-description"><p className="eyebrow">About this place</p><h2>A place with room to live.</h2><p>{listing.description}</p>{listing.address && <p className="address-line">{listing.address}</p>}</div><div className="detail-facts"><h2>At a glance</h2><div className="facts-grid"><span><strong>{listing.bedrooms}</strong> bedroom{listing.bedrooms === 1 ? '' : 's'}</span><span><strong>{listing.bathrooms}</strong> bathroom{listing.bathrooms === 1 ? '' : 's'}</span>{listing.surface_area && <span><strong>{listing.surface_area}</strong> m²</span>}<span><strong>{listing.available_spots}</strong> spot{listing.available_spots === 1 ? '' : 's'} available</span></div><div className="amenity-list">{listing.furnished && <span>Furnished</span>}{listing.internet_included && <span>Internet included</span>}{listing.parking && <span>Parking available</span>}<span>For {listing.gender_preference === 'any' ? 'everyone' : `${listing.gender_preference} tenants`}</span></div></div></section>
      <section className="availability-band"><div><p className="eyebrow">Move-in details</p><h2>Plan your next move.</h2></div><dl><div><dt>Available from</dt><dd>{listing.available_from ?? 'Contact owner'}</dd></div><div><dt>Deposit</dt><dd>{listing.deposit ? `${listing.deposit.toLocaleString()} MAD` : 'Not specified'}</dd></div><div><dt>Utilities</dt><dd>{listing.estimated_utilities ? `Around ${listing.estimated_utilities.toLocaleString()} MAD` : 'Not specified'}</dd></div></dl></section>
    </main>
  )
}