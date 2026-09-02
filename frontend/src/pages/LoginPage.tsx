import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/account'
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function submit(values: LoginFormValues) {
    try {
      await login(values)
      navigate(destination, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        for (const [fieldName, messages] of Object.entries(error.errors)) {
          if (fieldName === 'email' || fieldName === 'password') setError(fieldName, { message: messages[0] })
        }
      }
      setError('root', { message: error instanceof ApiError ? error.message : 'Unable to log in right now.' })
    }
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" to="/">meskni</Link>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back</p><h1 id="login-title">Log in to Meskni</h1><p className="auth-intro">Pick up where you left off.</p>
        <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
          <label className="field"><span>Email address</span><input type="email" autoComplete="email" {...register('email')} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
          <label className="field"><span>Password</span><input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <small className="field-error">{errors.password.message}</small>}</label>
          {errors.root && <p className="form-error" role="alert">{errors.root.message}</p>}
          <button className="button button-dark button-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Log in'}</button>
        </form>
        <p className="auth-switch">New to Meskni? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  )
}