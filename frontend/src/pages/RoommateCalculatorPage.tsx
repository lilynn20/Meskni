import { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import { calculateRoommateCost } from '../api/calculators'
import type { RoommatePayload, RoommateResult } from '../types/calculator'

const roommateSchema = z.object({
  monthly_rent: z.number().min(0, 'Rent cannot be negative.'),
  occupants: z.number().int().min(1, 'Add at least one occupant.').max(50, 'Use 50 occupants or fewer.'),
  utilities: z.number().min(0),
  additional_shared_costs: z.number().min(0),
})

const initialValues: RoommatePayload = { monthly_rent: 4000, occupants: 3, utilities: 600, additional_shared_costs: 300 }
const labels: Record<keyof RoommatePayload, string> = { monthly_rent: 'Monthly rent', occupants: 'Number of occupants', utilities: 'Shared utilities', additional_shared_costs: 'Additional shared costs' }

export function RoommateCalculatorPage() {
  const [values, setValues] = useState<RoommatePayload>(initialValues)
  const [result, setResult] = useState<RoommateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateValue(name: keyof RoommatePayload, value: string) {
    setValues((current) => ({ ...current, [name]: Number(value) }))
    setResult(null)
  }

  async function calculate() {
    const parsed = roommateSchema.safeParse(values)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your numbers.'); return }
    setLoading(true); setError(null)
    try { setResult(await calculateRoommateCost(parsed.data)) }
    catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Unable to calculate the split right now.') }
    finally { setLoading(false) }
  }

  return <main className="calculator-page site-shell"><nav className="topbar" aria-label="Roommate calculator navigation"><Link className="brand" to="/">meskni</Link><div className="topbar-actions"><Link className="button button-quiet" to="/listings">Browse listings</Link><Link className="button button-quiet" to="/account">Account</Link></div></nav><header className="calculator-header"><p className="eyebrow">Meskni tools</p><h1>Make shared costs simple.</h1><p className="welcome-copy">See what a home costs per person before you start comparing rooms.</p></header><section className="calculator-layout"><div className="calculator-form"><h2>Shared home costs</h2>{(Object.keys(values) as Array<keyof RoommatePayload>).map((name) => <label className="field" key={name}><span>{labels[name]} <em>{name === 'occupants' ? 'people' : 'MAD'}</em></span><input type="number" min={name === 'occupants' ? 1 : 0} step={name === 'occupants' ? 1 : 50} value={values[name]} onChange={(event) => updateValue(name, event.target.value)} /></label>)}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark button-submit" type="button" onClick={() => void calculate()} disabled={loading}>{loading ? 'Splitting costs...' : 'Split the cost'}</button></div><div className="calculator-result" aria-live="polite">{result ? <><p className="eyebrow">Per person estimate</p><p className="split-total">{result.total_monthly_cost_per_person.toLocaleString()} <span>MAD / month</span></p><p className="result-interpretation">Each person contributes an estimated <strong>{result.total_monthly_cost_per_person.toLocaleString()} MAD</strong> every month.</p><dl className="result-breakdown"><div><dt>Rent share</dt><dd>{result.rent_per_person.toLocaleString()} MAD</dd></div><div><dt>Utilities share</dt><dd>{result.utilities_per_person.toLocaleString()} MAD</dd></div><div><dt>Other shared costs</dt><dd>{result.additional_costs_per_person.toLocaleString()} MAD</dd></div></dl></> : <div className="result-prompt"><span aria-hidden="true">÷</span><h2>One home, clearer numbers.</h2><p>Add the shared costs and see the monthly contribution for each person.</p></div>}</div></section></main>
}