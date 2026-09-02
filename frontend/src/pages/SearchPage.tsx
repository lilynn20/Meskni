import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { searchListings } from '../api/listings'
import { SaveButton } from '../components/SaveButton'
import type { Listing, ListingFilters, ListingPage } from '../types/listing'

const emptyFilters: ListingFilters = { city: '', neighborhood: '', min_price: undefined, max_price: undefined, property_type: undefined, listing_type: undefined, furnished: undefined, parking: undefined }

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="listing-card-item">
      <div className="listing-placeholder" aria-hidden="true"><span>{listing.property_type}</span></div>
      <div className="listing-card-content">
        <div className="listing-card-heading"><p className="listing-location">{listing.city} · {listing.neighborhood}</p><div className="listing-card-actions"><span className="listing-price">{listing.rent.toLocaleString()} MAD</span><SaveButton listingId={listing.id} /></div></div>
        <h2>{listing.title}</h2>
        <p className="listing-summary">{listing.description}</p>
        <div className="listing-meta"><span>{listing.listing_type.replace('_', ' ')}</span><span>{listing.max_occupants} occupant{listing.max_occupants === 1 ? '' : 's'}</span>{listing.furnished && <span>Furnished</span>}</div>
        <Link className="button button-quiet listing-link" to={`/listings/${listing.id}`}>View listing</Link>
      </div>
    </article>
  )
}

export function SearchPage() {
  const [filters, setFilters] = useState<ListingFilters>(emptyFilters)
  const [results, setResults] = useState<ListingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadListings(nextFilters: ListingFilters = filters) {
    setLoading(true)
    setError(null)
    try {
      setResults(await searchListings({ ...nextFilters, per_page: 12 }))
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load listings right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void searchListings({ ...emptyFilters, per_page: 12 })
      .then(setResults)
      .catch((requestError: unknown) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load listings right now.'))
      .finally(() => setLoading(false))
  }, [])

  function updateFilter(name: keyof ListingFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value || undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void loadListings({ ...filters, page: 1 })
  }

  function changePage(page: number) {
    void loadListings({ ...filters, page })
  }

  return (
    <main className="search-page site-shell">
      <nav className="topbar" aria-label="Search navigation"><Link className="brand" to="/">meskni</Link><Link className="button button-quiet" to="/account">Account</Link></nav>
      <header className="search-header"><p className="eyebrow">The Meskni marketplace</p><h1>Find your next place.</h1><p className="welcome-copy">Search real listings by city, neighborhood, and the details that matter to you.</p></header>
      <form className="search-filters" onSubmit={submit}>
        <label className="field"><span>City</span><input value={filters.city ?? ''} onChange={(event) => updateFilter('city', event.target.value)} placeholder="Casablanca" /></label>
        <label className="field"><span>Neighborhood</span><input value={filters.neighborhood ?? ''} onChange={(event) => updateFilter('neighborhood', event.target.value)} placeholder="Maarif" /></label>
        <label className="field"><span>Min rent</span><input type="number" min="0" value={filters.min_price ?? ''} onChange={(event) => updateFilter('min_price', event.target.value)} /></label>
        <label className="field"><span>Max rent</span><input type="number" min="0" value={filters.max_price ?? ''} onChange={(event) => updateFilter('max_price', event.target.value)} /></label>
        <label className="field"><span>Property type</span><select value={filters.property_type ?? ''} onChange={(event) => updateFilter('property_type', event.target.value)}><option value="">Any type</option><option value="apartment">Apartment</option><option value="room">Room</option><option value="studio">Studio</option><option value="house">House</option></select></label>
        <label className="field"><span>Listing type</span><select value={filters.listing_type ?? ''} onChange={(event) => updateFilter('listing_type', event.target.value)}><option value="">Any arrangement</option><option value="entire_place">Entire place</option><option value="private_room">Private room</option><option value="shared_room">Shared room</option></select></label>
        <label className="choice filter-choice"><input type="checkbox" checked={filters.furnished === true} onChange={(event) => setFilters((current) => ({ ...current, furnished: event.target.checked ? true : undefined }))} /> Furnished only</label>
        <label className="choice filter-choice"><input type="checkbox" checked={filters.parking === true} onChange={(event) => setFilters((current) => ({ ...current, parking: event.target.checked ? true : undefined }))} /> Parking available</label>
        <button className="button button-dark filter-submit" type="submit">Search listings</button>
      </form>
      <section className="results-section" aria-live="polite"><div className="results-heading"><h2>{results ? `${results.meta.total} available listing${results.meta.total === 1 ? '' : 's'}` : 'Listings'}</h2>{loading && <span>Loading...</span>}</div>{error && <p className="form-error" role="alert">{error}</p>}{!loading && !error && results?.data.length === 0 && <p className="empty-results">No listings match those filters yet.</p>}<div className="listing-grid">{results?.data.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>{results && results.meta.last_page > 1 && <div className="pagination"><button className="button button-quiet" type="button" disabled={results.meta.current_page === 1} onClick={() => changePage(results.meta.current_page - 1)}>Previous</button><span>Page {results.meta.current_page} of {results.meta.last_page}</span><button className="button button-quiet" type="button" disabled={results.meta.current_page === results.meta.last_page} onClick={() => changePage(results.meta.current_page + 1)}>Next</button></div>}</section>
    </main>
  )
}