import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getReports, updateReport } from '../api/reports'
import type { Report, ReportStatus } from '../types/report'

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    void getReports().then(setReports).catch((requestError: unknown) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load reports.')).finally(() => setLoading(false))
  }, [])

  async function moderate(report: Report, status: Exclude<ReportStatus, 'pending'>) {
    setUpdating(report.id)
    setError(null)
    try {
      const updated = await updateReport(report.id, status, '')
      setReports((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update this report.')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <main className="page-state">Loading moderation queue...</main>

  return <main className="reports-page site-shell"><nav className="topbar" aria-label="Moderation navigation"><Link className="brand" to="/">meskni</Link><Link className="button button-quiet" to="/account">Account</Link></nav><header className="messages-header"><p className="eyebrow">Trust and safety</p><h1>Review reports carefully.</h1><p className="welcome-copy">Keep the marketplace useful by giving suspicious listings a clear review path.</p></header>{error && <p className="form-error" role="alert">{error}</p>}{!error && reports.length === 0 && <section className="saved-empty"><h2>No reports in the queue.</h2><p>New reports will appear here for review.</p></section>}<div className="report-list">{reports.map((report) => <article className="report-card" key={report.id}><div className="report-heading"><div><p className="listing-location">{report.listing.city} · {report.listing.neighborhood}</p><h2>{report.listing.title}</h2></div><span className={`report-status ${report.status}`}>{report.status.replace('_', ' ')}</span></div><p className="report-meta">Reported by {report.reporter.name} · Reason: {report.reason}</p>{report.details && <p className="report-details">{report.details}</p>}<div className="report-actions"><Link className="button button-quiet" to={`/listings/${report.listing.id}`}>View listing</Link><button className="button button-quiet" type="button" disabled={updating === report.id} onClick={() => void moderate(report, 'under_review')}>Review</button><button className="button button-dark" type="button" disabled={updating === report.id} onClick={() => void moderate(report, 'resolved')}>Resolve</button><button className="button button-quiet" type="button" disabled={updating === report.id} onClick={() => void moderate(report, 'dismissed')}>Dismiss</button></div></article>)}</div></main>
}