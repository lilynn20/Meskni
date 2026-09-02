import { apiRequest } from './client'
import type { Report, ReportReason, ReportStatus } from '../types/report'

export async function submitReport(listingId: number, reason: ReportReason, details: string): Promise<Report> {
  const response = await apiRequest<{ data: Report }>(`/listings/${listingId}/reports`, { method: 'POST', body: JSON.stringify({ reason, details: details || undefined }) })
  return response.data
}

export async function getReports(): Promise<Report[]> {
  const response = await apiRequest<{ data: Report[] }>('/reports')
  return response.data
}

export async function updateReport(id: number, status: Exclude<ReportStatus, 'pending'>, adminNotes: string): Promise<Report> {
  const response = await apiRequest<{ data: Report }>(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, admin_notes: adminNotes || undefined }) })
  return response.data
}