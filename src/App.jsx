import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'


// Pages Pro
import Login from './pages/pro/Login'
import Register from './pages/pro/Register'
import Dashboard from './pages/pro/Dashboard'
import Clients from './pages/pro/Clients'
import Scanner from './pages/pro/Scanner'
import Profil from './pages/pro/Profil'
import Abonnement from './pages/pro/Abonnement'
import Annonces from './pages/pro/Annonces'

// Pages Client
import Rejoindre from './pages/client/Rejoindre'
import CarteClient from './pages/client/CarteClient'

// Route protégée
function PrivateRoute({ children }) {
  const { pro, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Chargement...</div>
  return pro ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pro — protégé */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/dashboard/scanner" element={<PrivateRoute><Scanner /></PrivateRoute>} />
        <Route path="/dashboard/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
        <Route path="/dashboard/abonnement" element={<PrivateRoute><Abonnement /></PrivateRoute>} />
        <Route path="/dashboard/annonces" element={<PrivateRoute><Annonces /></PrivateRoute>} />

        {/* Client — public */}
        <Route path="/rejoindre/:slug" element={<Rejoindre />} />
        <Route path="/carte/:serial" element={<CarteClient />} />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}