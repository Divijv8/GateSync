import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const location = useLocation()

  if (location.pathname === '/login') {
    return null
  }

  return (
    <header className="navbar">
      <div>
        <div className="brand">GateSync</div>
        <p className="brand-subtitle">Visitor & Access Pass Management</p>
      </div>
      <nav className="nav-links">
        <Link to="/admin">Admin</Link>
        <Link to="/employee">Employee</Link>
        <Link to="/gate">Gate</Link>
        <Link to="/register">Register</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <div className="nav-user">
        <span>{currentUser?.username ?? 'Guest'}</span>
        <button type="button" className="secondary-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
