import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AccountPage() {
  const { user, logout } = useAuth()

  return (
    <main className="site-shell account-shell">
      <nav className="topbar" aria-label="Account navigation"><span className="brand">meskni</span><button className="button button-quiet" type="button" onClick={() => void logout()}>Log out</button></nav>
      <section className="account-panel"><p className="eyebrow">Your account</p><h1>Good to have you, {user?.name}.</h1><p className="welcome-copy">Your Meskni account is ready. Your next step is waiting below.</p><div className="account-actions">{user?.role === 'seeker' && <Link className="button button-dark" to="/saved">Saved listings</Link>}{(user?.role === 'owner' || user?.role === 'admin') && <Link className="button button-dark" to="/listings/new">Create a listing</Link>}</div><dl className="account-details"><div><dt>Email</dt><dd>{user?.email}</dd></div><div><dt>City</dt><dd>{user?.city}</dd></div><div><dt>Account type</dt><dd>{user?.role}</dd></div></dl></section>
    </main>
  )
}