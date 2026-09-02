import { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import { calculateAffordability } from '../api/calculators'
import type { AffordabilityPayload, AffordabilityResult } from '../types/calculator'

const calculatorSchema = z.object({
  monthly_income: z.number().positive('Enter your monthly income.'),
  monthly_rent: z.number().min(0, 'Rent cannot be negative.'),
  utilities: z.number().min(0), transport: z.number().min(0), food: z.number().min(0), other_expenses: z.number().min(0),
})

const initialValues: AffordabilityPayload = { monthly_income: 7000, monthly_rent: 2500, utilities: 400, transport: 500, food: 1200, other_expenses: 300 }

const labels: Record<keyof AffordabilityPayload, string> = { monthly_income: 'Monthly income', monthly_rent: 'Monthly rent', utilities: 'Utilities', transport: 'Transport', food: 'Food', other_expenses: 'Other expenses' }

function statusCopy(result: AffordabilityResult) {
  if (result.status === 'comfortable') return 'Your housing cost sits in a comfortable range.'
  if (result.status === 'stretched') return 'This could work, but your housing cost deserves a careful look.'
  if (result.status === 'high') return 'Housing takes a high share of your income. Consider a lower-cost option.'
  return 'These expenses are higher than your income. This place is not affordable on this budget.'
}

export function AffordabilityPage() {
  const [values, setValues] = useState<AffordabilityPayload>(initialValues)
  const [result, setResult] = useState<AffordabilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateValue(name: keyof AffordabilityPayload, value: string) {
    setValues((current) => ({ ...current, [name]: Number(value) }))
    setResult(null)
  }

  async function calculate() {
    const parsed = calculatorSchema.safeParse(values)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your numbers.'); return }
    setLoading(true); setError(null)
    try { setResult(await calculateAffordability(parsed.data)) }
    catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Unable to calculate affordability right now.') }
    finally { setLoading(false) }
  }

  return <main className="calculator-page site-shell"><nav className="topbar" aria-label="Calculator navigation"><Link className="brand" to="/">meskni</Link><div className="topbar-actions"><Link className="button button-quiet" to="/listings">Browse listings</Link><Link className="button button-quiet" to="/account">Account</Link></div></nav><header className="calculator-header"><p className="eyebrow">Meskni tools</p><h1>Know what fits your life.</h1><p className="welcome-copy">Estimate the real monthly weight of a home before you commit.</p></header><section className="calculator-layout"><div className="calculator-form"><h2>Your monthly budget</h2>{(Object.keys(values) as Array<keyof AffordabilityPayload>).map((name) => <label className="field" key={name}><span>{labels[name]} <em>MAD</em></span><input type="number" min="0" step="50" value={values[name]} onChange={(event) => updateValue(name, event.target.value)} /></label>)}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark button-submit" type="button" onClick={() => void calculate()} disabled={loading}>{loading ? 'Calculating...' : 'Calculate affordability'}</button></div><div className="calculator-result" aria-live="polite">{result ? <><p className="eyebrow">Your estimate</p><div className={`result-status ${result.status}`}>{result.status}</div><p className="result-interpretation">Housing represents <strong>{result.housing_percentage}%</strong> of your monthly income. {statusCopy(result)}</p><dl className="result-breakdown"><div><dt>Total expenses</dt><dd>{result.total_monthly_expenses.toLocaleString()} MAD</dd></div><div><dt>Remaining income</dt><dd className={result.remaining_income < 0 ? 'negative' : ''}>{result.remaining_income.toLocaleString()} MAD</dd></div><div><dt>Housing share</dt><dd>{result.housing_percentage}%</dd></div></dl></> : <div className="result-prompt"><span aria-hidden="true">∿</span><h2>Your numbers, made clearer.</h2><p>Enter your monthly costs to see what remains after housing and everyday essentials.</p></div>}</div></section></main>
}