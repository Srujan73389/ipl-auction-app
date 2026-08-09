import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuction } from './context/AuctionContext.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import TeamBidding from './pages/TeamBidding.jsx'
import SpectatorView from './pages/SpectatorView.jsx'

function ProtectedAdmin({ children }) {
  const { state } = useAuction()
  return state.role === 'admin' ? children : <Navigate to="/" replace />
}

function ProtectedTeam({ children }) {
  const { state } = useAuction()
  return state.role && state.role !== 'admin' ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Login />} />
      <Route path="/spectate" element={<SpectatorView />} />
      <Route path="/admin"    element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/bid"      element={<ProtectedTeam><TeamBidding /></ProtectedTeam>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  )
}
