import type { Listing } from './listing'

export type ReportReason = 'scam' | 'misleading' | 'duplicate' | 'inappropriate' | 'other'
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed'

export type Report = {
  id: number
  listing_id: number
  reporter_id: number
  reason: ReportReason
  details: string | null
  status: ReportStatus
  admin_notes: string | null
  listing: Pick<Listing, 'id' | 'title' | 'city' | 'neighborhood'>
  reporter: { id: number; name: string }
  created_at: string
}