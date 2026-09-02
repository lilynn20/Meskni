import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <Link className="brand" to="/">meskni</Link>
        <div className="topbar-actions">
          {isAuthenticated ? (
            <Link className="button button-quiet" to="/account">{user?.name}&apos;s account</Link>
          ) : (
            <><Link className="button button-quiet" to="/login">Log in</Link><Link className="button button-dark" to="/register">Create account</Link></>
          )}
        </div>
      </nav>
      <section className="welcome-panel">
        <p className="eyebrow">Housing, made human</p>
        <h1>Find a place that feels like yours.</h1>
        <p className="welcome-copy">Meskni brings Morocco&apos;s rental search into one calmer, clearer place.</p>
        <div className="welcome-actions">
          <Link className="button button-dark" to={isAuthenticated ? '/account' : '/register'}>{isAuthenticated ? 'Open your account' : 'Start with Meskni'}</Link>
          <Link className="button button-quiet" to="/listings">Browse listings</Link>
          <Link className="button button-quiet" to="/calculators/affordability">Check affordability</Link>
          <span className="welcome-note">Your next chapter starts here.</span>
        </div>
      </section>
    </main>
  )
}