import { BrowserRouter } from 'react-router-dom'
import { CookieConsentBanner } from './components/CookieConsentBanner'
import { SiteFooter } from './components/SiteFooter'
import { AppRoutes } from './routes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppRoutes />
        <CookieConsentBanner />
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
