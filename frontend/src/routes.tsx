import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AccountPage } from './pages/AccountPage'
import { CreateListingPage } from './pages/CreateListingPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { RegisterPage } from './pages/RegisterPage'
import { SearchPage } from './pages/SearchPage'
import { SavedListingsPage } from './pages/SavedListingsPage'
import { MessagesPage } from './pages/MessagesPage'
import { ReportsPage } from './pages/ReportsPage'
import { AffordabilityPage } from './pages/AffordabilityPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <main className="page-state">Restoring your session...</main>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth()

  if (status === 'loading') return <main className="page-state">Restoring your session...</main>
  if (user?.role !== 'owner' && user?.role !== 'admin') return <Navigate to="/account" replace />
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/listings" element={<SearchPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="/saved" element={<ProtectedRoute><SavedListingsPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/calculators/affordability" element={<AffordabilityPage />} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="/listings/new" element={<ProtectedRoute><OwnerRoute><CreateListingPage /></OwnerRoute></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}