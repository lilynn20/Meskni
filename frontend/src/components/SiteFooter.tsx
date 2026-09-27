import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Link className="brand footer-brand" to="/">meskni</Link>
          <p className="footer-copy">
            Meskni helps people discover rooms and homes in Morocco with clear pricing, simple filters,
            and respectful communication.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h2>Company</h2>
            <ul>
              <li><Link to="/legal/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/legal/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/legal/refund-policy">Refund Policy</Link></li>
              <li><Link to="/legal/cookie-policy">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              <li><a href="mailto:hello@meskni.ma">hello@meskni.ma</a></li>
              <li><a href="tel:+212522123456">+212 522 123 456</a></li>
              <li><span>Casablanca, Morocco</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
