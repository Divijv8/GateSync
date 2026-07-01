import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ visitors: 0, passes: 0, blacklist: 0, users: 0 })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [visitors, blacklist, users, passes] = await Promise.all([
          api.get('/visitors'),
          api.get('/blacklist'),
          api.get('/users'),
          api.get('/passes'),
        ])
        setStats({
          visitors: visitors.data.length,
          passes: passes.data.filter(p =>
            p.status === 'active' &&
            (!p.expires_at || new Date(p.expires_at) > new Date())
          ).length,
          blacklist: blacklist.data.length,
          users: users.data.length,
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [])

  return (
    <main className="page-shell">
      <h1>Admin Dashboard</h1>
      <p>System overview and quick access.</p>

      <div className="grid four-up" style={{ marginBottom: '24px' }}>
        <section className="card stat-card">
          <div className="stat-number">{stats.visitors}</div>
          <div className="stat-label">Total Visitors</div>
        </section>
        <section className="card stat-card">
          <div className="stat-number">{stats.users}</div>
          <div className="stat-label">System Users</div>
        </section>
        <section className="card stat-card">
          <div className="stat-number">{stats.blacklist}</div>
          <div className="stat-label">Blacklisted</div>
        </section>
        <section className="card stat-card">
          <div className="stat-number">{stats.passes}</div>
          <div className="stat-label">Active Passes</div>
        </section>
      </div>

      <div className="grid two-up">
        <section className="card">
          <h3>User Management</h3>
          <p>Create and manage system user profiles and roles.</p>
          <Link to="/users">Manage Users →</Link>
        </section>
        <section className="card">
          <h3>Visitor Registry</h3>
          <p>Register new visitors and issue access passes.</p>
          <Link to="/register">Register Visitor →</Link>
        </section>
        <section className="card">
          <h3>Blacklist</h3>
          <p>Manage blacklisted individuals and access restrictions.</p>
          <Link to="/blacklist">View Blacklist →</Link>
        </section>
        <section className="card">
          <h3>Reports</h3>
          <p>Generate and download PDF reports.</p>
          <Link to="/reports">Generate Reports →</Link>
        </section>
        <section className="card">
          <h3>Gate Activity</h3>
          <p>Monitor entry and exit logs in real time.</p>
          <Link to="/gate">Gate Screen →</Link>
        </section>
        <section className="card">
          <h3>Visitor History</h3>
          <p>Browse all registered visitors and their passes.</p>
          <Link to="/history">View History →</Link>
        </section>
      </div>
    </main>
  )
}