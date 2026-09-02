import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().trim().min(6, 'Enter a valid phone number.'),
  city: z.string().trim().min(2, 'Enter your city.'),
  role: z.enum(['seeker', 'owner']),
  password: z.string().min(8, 'Use at least 8 characters.'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'seeker' } })

  async function submit(values: RegisterFormValues) {
    try {
      await registerUser(values)
      navigate('/account', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        for (const [fieldName, messages] of Object.entries(error.errors)) {
          if (fieldName === 'name' || fieldName === 'email' || fieldName === 'phone' || fieldName === 'city' || fieldName === 'role' || fieldName === 'password') setError(fieldName, { message: messages[0] })
        }
      }
      setError('root', { message: error instanceof ApiError ? error.message : 'Unable to create your account right now.' })
    }
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" to="/">meskni</Link>
      <section className="auth-card auth-card-wide" aria-labelledby="register-title">
        <p className="eyebrow">Make room for what matters</p><h1 id="register-title">Create your Meskni account</h1><p className="auth-intro">A few details now, a better housing search next.</p>
        <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="field-grid"><label className="field"><span>Full name</span><input autoComplete="name" {...register('name')} />{errors.name && <small className="field-error">{errors.name.message}</small>}</label><label className="field"><span>City</span><input autoComplete="address-level2" {...register('city')} />{errors.city && <small className="field-error">{errors.city.message}</small>}</label></div>
          <label className="field"><span>Email address</span><input type="email" autoComplete="email" {...register('email')} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
          <label className="field"><span>Phone number</span><input type="tel" autoComplete="tel" {...register('phone')} />{errors.phone && <small className="field-error">{errors.phone.message}</small>}</label>
          <fieldset className="field role-field"><legend>I am joining as</legend><label className="choice"><input type="radio" value="seeker" {...register('role')} /> Looking for housing</label><label className="choice"><input type="radio" value="owner" {...register('role')} /> Offering a property</label>{errors.role && <small className="field-error">{errors.role.message}</small>}</fieldset>
          <label className="field"><span>Password</span><input type="password" autoComplete="new-password" {...register('password')} />{errors.password && <small className="field-error">{errors.password.message}</small>}</label>
          {errors.root && <p className="form-error" role="alert">{errors.root.message}</p>}
          <button className="button button-dark button-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </section>
    </main>
  )
}