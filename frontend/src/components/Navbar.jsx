import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const location = useLocation()

  if (location.pathname === '/login') return null

  const role = currentUser?.role

  return (
    <header className="navbar">
      <div>
        <div className="brand">GateSync</div>
        <p className="brand-subtitle">Visitor & Access Pass Management</p>
      </div>
      <nav className="nav-links">
        {role === 'admin' && <Link to="/admin">Dashboard</Link>}
        {(role === 'admin' || role === 'employee') && <Link to="/employee">Employee</Link>}
        {(role === 'admin' || role === 'employee') && <Link to="/register">Register Visitor</Link>}
        {(role === 'admin' || role === 'employee') && <Link to="/history">Visitor History</Link>}
        {(role === 'admin' || role === 'gate_operator') && <Link to="/gate">Gate</Link>}
        {role === 'admin' && <Link to="/blacklist">Blacklist</Link>}
        {role === 'admin' && <Link to="/reports">Reports</Link>}
        {role === 'admin' && <Link to="/users">Users</Link>}
      </nav>
      <div className="nav-user">
        <span>{currentUser?.username ?? 'Guest'}</span>
        <span style={{ fontSize: '11px', opacity: 0.6 }}>({role})</span>
        <button type="button" className="secondary-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}