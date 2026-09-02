import { apiRequest } from './client'
import type { CreateListingPayload, Listing } from '../types/listing'

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