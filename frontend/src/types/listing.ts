export type PropertyType = 'apartment' | 'room' | 'studio' | 'house'
export type ListingType = 'entire_place' | 'private_room' | 'shared_room'
export type GenderPreference = 'any' | 'female' | 'male'

export type Listing = {
  id: number
  owner_id: number
  title: string
  description: string
  property_type: PropertyType
  listing_type: ListingType
  city: string
  neighborhood: string
  address: string | null
  rent: number
  estimated_utilities: number
  deposit: number
  available_from: string | null
  bedrooms: number
  bathrooms: number
  surface_area: number | null
  furnished: boolean
  internet_included: boolean
  parking: boolean
  gender_preference: GenderPreference
  current_occupants: number
  available_spots: number
  max_occupants: number
  status: string
  created_at: string | null
  updated_at: string | null
  owner?: { id: number; name: string }
  images?: ListingImage[]
}

export type ListingImage = {
  id: number
  path: string
  original_name: string
  mime_type: string
  size: number
}

export type CreateListingPayload = Omit<Listing, 'id' | 'owner_id' | 'status' | 'created_at' | 'updated_at' | 'address' | 'available_from' | 'estimated_utilities' | 'deposit' | 'bedrooms' | 'bathrooms' | 'surface_area' | 'current_occupants' | 'available_spots'> & {
  address?: string | null
  available_from?: string | null
  estimated_utilities?: number
  deposit?: number
  bedrooms?: number
  bathrooms?: number
  surface_area?: number
  current_occupants?: number
  available_spots?: number
  status?: string
}

export type ListingFilters = {
  city?: string
  neighborhood?: string
  min_price?: number
  max_price?: number
  property_type?: PropertyType
  listing_type?: ListingType
  furnished?: boolean
  internet_included?: boolean
  parking?: boolean
  available_from?: string
  gender_preference?: GenderPreference
  page?: number
  per_page?: number
}

export type ListingPage = {
  data: Listing[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}