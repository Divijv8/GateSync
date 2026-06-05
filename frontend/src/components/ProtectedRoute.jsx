import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
