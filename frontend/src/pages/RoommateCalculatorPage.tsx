import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
const fieldMeta: Record<keyof RoommatePayload, { unit: string, step: number, min: number }> = {
  monthly_rent: { unit: 'MAD', step: 50, min: 0 },
  occupants: { unit: 'people', step: 1, min: 1 },
  utilities: { unit: 'MAD', step: 50, min: 0 },
  additional_shared_costs: { unit: 'MAD', step: 50, min: 0 },
}

export function RoommateCalculatorPage() {
  const [searchParams] = useSearchParams()
  const [values, setValues] = useState<RoommatePayload>(() => ({
    ...initialValues,
    monthly_rent: Number(searchParams.get('monthly_rent') ?? initialValues.monthly_rent),
    occupants: Number(searchParams.get('occupants') ?? initialValues.occupants),
    utilities: Number(searchParams.get('utilities') ?? initialValues.utilities),
    additional_shared_costs: Number(searchParams.get('additional_shared_costs') ?? initialValues.additional_shared_costs),
  }))
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

  return (
    <main className="calculator-page site-shell">
      <nav className="topbar" aria-label="Roommate calculator navigation">
        <Link className="brand" to="/">meskni</Link>
        <div className="topbar-actions">
          <Link className="button button-quiet" to="/listings">Browse listings</Link>
          <Link className="button button-quiet" to="/account">Account</Link>
        </div>
      </nav>

      <header className="calculator-header">
        <p className="eyebrow">Meskni tools</p>
        <h1>Make shared costs simple.</h1>
        <p className="welcome-copy">See what a home costs per person before you start comparing rooms.</p>
      </header>

      <section className="calculator-layout">
        <div className="calculator-form">
          <h2>Shared home costs</h2>

          {(Object.keys(values) as Array<keyof RoommatePayload>).map((name) => (
            <label className="field" key={name}>
              <span>
                {labels[name]}
                <em>{fieldMeta[name].unit}</em>
              </span>
              <input
                type="number"
                min={fieldMeta[name].min}
                step={fieldMeta[name].step}
                value={values[name]}
                onChange={(event) => updateValue(name, event.target.value)}
              />
            </label>
          ))}

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-dark button-submit" type="button" onClick={() => void calculate()} disabled={loading}>
            {loading ? 'Splitting costs...' : 'Split the cost'}
          </button>
        </div>

        <div className="calculator-result" aria-live="polite">
          {result ? (
            <>
              <div className="result-pill">Per person estimate</div>
              <p className="split-total">
                {result.total_monthly_cost_per_person.toLocaleString()} <span>MAD / month</span>
              </p>

              <p className="result-interpretation">
                Each person contributes an estimated <strong>{result.total_monthly_cost_per_person.toLocaleString()} MAD</strong> every month.
              </p>

              <div className="result-stat-grid">
                <div className="result-stat-card">
                  <span>Rent share</span>
                  <strong>{result.rent_per_person.toLocaleString()} MAD</strong>
                </div>
                <div className="result-stat-card">
                  <span>Utilities</span>
                  <strong>{result.utilities_per_person.toLocaleString()} MAD</strong>
                </div>
                <div className="result-stat-card">
                  <span>Shared costs</span>
                  <strong>{result.additional_costs_per_person.toLocaleString()} MAD</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="result-prompt">
              <span aria-hidden="true">÷</span>
              <h2>One home, clearer numbers.</h2>
              <p>Add the shared costs and see the monthly contribution for each person.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}