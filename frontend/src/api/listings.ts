import { apiRequest } from './client'
import type { CreateListingPayload, Listing, ListingFilters, ListingPage } from '../types/listing'

export async function getSavedListings(): Promise<Listing[]> {
  const response = await apiRequest<{ data: Listing[] }>('/saved-listings')
  return response.data
}

export async function saveListing(id: number): Promise<void> {
  await apiRequest(`/listings/${id}/save`, { method: 'POST' })
}

export async function unsaveListing(id: number): Promise<void> {
  await apiRequest(`/listings/${id}/save`, { method: 'DELETE' })
}

export async function getListing(id: string): Promise<Listing> {
  const response = await apiRequest<{ data: Listing }>(`/listings/${id}`)
  return response.data
}

export function listingImageUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? '/api'
  return `${apiUrl.replace(/\/api\/?$/, '')}/storage/${path}`
}

export async function searchListings(filters: ListingFilters = {}): Promise<ListingPage> {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }

  const query = params.toString()
  const response = await apiRequest<ListingPage>(`/listings${query ? `?${query}` : ''}`)
  return response
}

export async function createListing(payload: CreateListingPayload): Promise<Listing> {
  const response = await apiRequest<{ data: Listing }>('/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function uploadListingImages(listingId: number, images: File[]): Promise<void> {
  const formData = new FormData()
  images.forEach((image) => formData.append('images[]', image))
  await apiRequest(`/listings/${listingId}/images`, { method: 'POST', body: formData })
}