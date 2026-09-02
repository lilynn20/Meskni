import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import { createListing, uploadListingImages } from '../api/listings'

const optionalNumber = z.preprocess(
  (value) => value === '' || value === undefined ? undefined : value,
  z.coerce.number().min(0, 'Use zero or a positive number.').optional(),
)
const optionalInteger = z.preprocess(
  (value) => value === '' || value === undefined ? undefined : value,
  z.coerce.number().int('Use a whole number.').min(0, 'Use zero or a positive number.').optional(),
)

const listingSchema = z.object({
  title: z.string().trim().min(3, 'Add a clear listing title.'),
  description: z.string().trim().min(20, 'Add at least 20 characters describing the place.'),
  property_type: z.enum(['apartment', 'room', 'studio', 'house']),
  listing_type: z.enum(['entire_place', 'private_room', 'shared_room']),
  city: z.string().trim().min(2, 'Enter the city.'),
  neighborhood: z.string().trim().min(2, 'Enter the neighborhood.'),
  address: z.string().optional(),
  rent: z.coerce.number().positive('Rent must be greater than zero.'),
  estimated_utilities: optionalNumber,
  deposit: optionalNumber,
  available_from: z.string().optional(),
  bedrooms: optionalInteger,
  bathrooms: optionalInteger,
  surface_area: optionalNumber,
  furnished: z.boolean(),
  internet_included: z.boolean(),
  parking: z.boolean(),
  gender_preference: z.enum(['any', 'female', 'male']),
  current_occupants: optionalInteger,
  available_spots: optionalInteger,
  max_occupants: z.coerce.number().int().positive('Maximum occupants must be greater than zero.'),
}).superRefine((values, context) => {
  const currentOccupants = values.current_occupants ?? 0
  const availableSpots = values.available_spots ?? 0
  if (currentOccupants + availableSpots > values.max_occupants) {
    context.addIssue({ code: 'custom', path: ['current_occupants'], message: 'Occupants and available spots cannot exceed the maximum.' })
  }
})

type ListingFormInput = z.input<typeof listingSchema>
type ListingFormValues = z.output<typeof listingSchema>

const defaultValues = {
  title: '', description: '', property_type: 'apartment' as const, listing_type: 'entire_place' as const, city: '', neighborhood: '', address: '', rent: 0,
  estimated_utilities: undefined, deposit: undefined, available_from: '', bedrooms: undefined, bathrooms: undefined, surface_area: undefined,
  furnished: false, internet_included: false, parking: false, gender_preference: 'any' as const, current_occupants: 0, available_spots: 0, max_occupants: 1,
}

export function CreateListingPage() {
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ListingFormInput, unknown, ListingFormValues>({ resolver: zodResolver(listingSchema), defaultValues })

  useEffect(() => () => selectedImages.forEach(({ preview }) => URL.revokeObjectURL(preview)), [selectedImages])

  function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const invalidFile = Array.from(event.target.files ?? []).find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)
    if (invalidFile) {
      setSubmitError(`${invalidFile.name} must be a JPEG, PNG, or WebP image no larger than 2 MB.`)
      setSelectedImages([])
      return
    }

    setSubmitError(null)
    setSelectedImages(Array.from(event.target.files ?? []).map((file) => ({ file, preview: URL.createObjectURL(file) })))
  }

  async function submit(values: ListingFormValues) {
    setSubmitError(null)
    setSuccessMessage(null)
    try {
      const listing = await createListing({ ...values, address: values.address || null, available_from: values.available_from || null })
      if (selectedImages.length > 0) await uploadListingImages(listing.id, selectedImages.map(({ file }) => file))
      setSuccessMessage('Listing created. Opening your new listing...')
      window.setTimeout(() => navigate(`/listings/${listing.id}`, { replace: true }), 700)
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        for (const [fieldName, messages] of Object.entries(error.errors)) {
          if (fieldName in defaultValues) setError(fieldName as keyof ListingFormValues, { message: messages[0] })
        }
      }
      setSubmitError(error instanceof ApiError ? error.message : 'Unable to create this listing right now.')
    }
  }

  function fieldError(fieldName: keyof ListingFormValues) {
    return errors[fieldName] && <small className="field-error">{errors[fieldName]?.message as string}</small>
  }

  return (
    <main className="auth-page listing-page">
      <div className="form-header"><Link className="brand" to="/account">meskni</Link><Link className="button button-quiet" to="/account">Cancel</Link></div>
      <section className="listing-card" aria-labelledby="create-listing-title">
        <p className="eyebrow">Owner workspace</p><h1 id="create-listing-title">Create a listing</h1><p className="auth-intro">Give people the details they need to picture themselves there.</p>
        <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
          <label className="field"><span>Title</span><input {...register('title')} placeholder="Sunny room near the city centre" />{fieldError('title')}</label>
          <label className="field"><span>Description</span><textarea rows={5} {...register('description')} placeholder="Tell seekers what makes this place work." />{fieldError('description')}</label>
          <div className="field-grid"><label className="field"><span>Property type</span><select {...register('property_type')}><option value="apartment">Apartment</option><option value="room">Room</option><option value="studio">Studio</option><option value="house">House</option></select>{fieldError('property_type')}</label><label className="field"><span>Listing type</span><select {...register('listing_type')}><option value="entire_place">Entire place</option><option value="private_room">Private room</option><option value="shared_room">Shared room</option></select>{fieldError('listing_type')}</label></div>
          <div className="field-grid"><label className="field"><span>City</span><input {...register('city')} />{fieldError('city')}</label><label className="field"><span>Neighborhood</span><input {...register('neighborhood')} />{fieldError('neighborhood')}</label></div>
          <label className="field"><span>Address <em>optional</em></span><input {...register('address')} />{fieldError('address')}</label>
          <div className="field-grid"><label className="field"><span>Monthly rent</span><input type="number" min="1" step="0.01" {...register('rent')} />{fieldError('rent')}</label><label className="field"><span>Deposit <em>optional</em></span><input type="number" min="0" step="0.01" {...register('deposit')} />{fieldError('deposit')}</label></div>
          <div className="field-grid"><label className="field"><span>Estimated utilities <em>optional</em></span><input type="number" min="0" step="0.01" {...register('estimated_utilities')} />{fieldError('estimated_utilities')}</label><label className="field"><span>Available from <em>optional</em></span><input type="date" {...register('available_from')} />{fieldError('available_from')}</label></div>
          <div className="field-grid"><label className="field"><span>Bedrooms</span><input type="number" min="0" {...register('bedrooms')} />{fieldError('bedrooms')}</label><label className="field"><span>Bathrooms</span><input type="number" min="0" {...register('bathrooms')} />{fieldError('bathrooms')}</label></div>
          <div className="field-grid"><label className="field"><span>Surface area m²</span><input type="number" min="0" step="0.01" {...register('surface_area')} />{fieldError('surface_area')}</label><label className="field"><span>Gender preference</span><select {...register('gender_preference')}><option value="any">Any</option><option value="female">Women</option><option value="male">Men</option></select>{fieldError('gender_preference')}</label></div>
          <div className="field-grid"><label className="field"><span>Current occupants</span><input type="number" min="0" {...register('current_occupants')} />{fieldError('current_occupants')}</label><label className="field"><span>Available spots</span><input type="number" min="0" {...register('available_spots')} />{fieldError('available_spots')}</label></div>
          <label className="field"><span>Maximum occupants</span><input type="number" min="1" {...register('max_occupants')} />{fieldError('max_occupants')}</label>
          <fieldset className="field role-field"><legend>Included features</legend><label className="choice"><input type="checkbox" {...register('furnished')} /> Furnished</label><label className="choice"><input type="checkbox" {...register('internet_included')} /> Internet included</label><label className="choice"><input type="checkbox" {...register('parking')} /> Parking available</label></fieldset>
          <div className="field"><span>Photos <em>optional, JPEG/PNG/WebP up to 2 MB each</em></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectImages} />{selectedImages.length > 0 && <div className="image-previews">{selectedImages.map(({ preview }, index) => <img key={preview} src={preview} alt={`Selected property photo ${index + 1}`} />)}</div>}</div>
          {submitError && <p className="form-error" role="alert">{submitError}</p>}
          {successMessage && <p className="form-success" role="status">{successMessage}</p>}
          <button className="button button-dark button-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing listing...' : 'Publish listing'}</button>
        </form>
      </section>
    </main>
  )
}