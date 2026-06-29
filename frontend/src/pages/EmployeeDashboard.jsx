import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function EmployeeDashboard() {
  const { currentUser } = useAuth()
  const [recentVisitors, setRecentVisitors] = useState([])
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/visitors')
      .then(res => {
        const all = res.data
        const today = new Date().toDateString()
        const todayCount = all.filter(v =>
          new Date(v.created_at).toDateString() === today
        ).length
        setStats({ total: all.length, today: todayCount })
        setRecentVisitors(all.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <main className="page-shell">
      <h1>Employee Dashboard</h1>
      <p>Welcome, {currentUser?.username}. Register visitors and manage access passes.</p>

      {/* Stats */}
      <div className="grid four-up" style={{ marginBottom: '24px' }}>
        <section className="card stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Visitors</div>
        </section>
        <section className="card stat-card">
          <div className="stat-number">{stats.today}</div>
          <div className="stat-label">Registered Today</div>
        </section>
        <section className="card stat-card">
          <div className="stat-number">—</div>
          <div className="stat-label">Pending Passes</div>
        </section>
        <section className="card stat-card">
          <div className="stat-number">—</div>
          <div className="stat-label">Active Passes</div>
        </section>
      </div>

      {/* Quick Actions */}
      <div className="grid two-up" style={{ marginBottom: '24px' }}>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Register New Visitor</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Register a visitor and issue an access pass in one step.
          </p>
          <Link to="/register">
            <button style={{ width: '100%' }}>Register Visitor & Issue Pass →</button>
          </Link>
        </section>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Visitor History</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Browse all registered visitors and their pass details.
          </p>
          <Link to="/history">
            <button style={{ width: '100%' }} className="secondary-button">View History →</button>
          </Link>
        </section>
      </div>

      {/* Recent Visitors */}
      <section className="card">
        <h3 style={{ marginBottom: '12px' }}>Recently Registered Visitors</h3>
        {loading && <p>Loading...</p>}
        {!loading && recentVisitors.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            No visitors registered yet.{' '}
            <Link to="/register" style={{ color: '#102033', fontWeight: 600 }}>Register one now →</Link>
          </p>
        )}
        {recentVisitors.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: 'var(--surface-alt)' }}>
              <tr>
                {['Name', 'Company', 'Purpose', 'Host', 'Registered'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentVisitors.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                    {v.first_name} {v.last_name}
                  </td>
                  <td style={{ padding: '8px 12px' }}>{v.company ?? '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{v.purpose}</td>
                  <td style={{ padding: '8px 12px' }}>{v.host_name ?? '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{formatDate(v.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}