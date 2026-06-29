import { useEffect, useState } from 'react'
import api from '../api/axios.js'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
  { value: 'gate_operator', label: 'Gate Operator' },
]

const EMPTY_FORM = {
  username: '',
  full_name: '',
  email: '',
  password: '',
  role: 'gate_operator',
  is_active: true,
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    try {
      await api.post('/users', form)
      setSuccessMsg(`User "${form.username}" created successfully.`)
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user.')
    }
  }

  async function toggleActive(user) {
    setError('')
    try {
      await api.patch(`/users/${user.id}`, { is_active: !user.is_active })
      setSuccessMsg(`${user.full_name} ${!user.is_active ? 'activated' : 'deactivated'}.`)
      fetchUsers()
    } catch {
      setError('Failed to update user.')
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    setError('')
    try {
      await api.delete(`/users/${user.id}`)
      setSuccessMsg(`User "${user.username}" deleted.`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user.')
    }
  }

  const roleLabel = (role) => ROLES.find(r => r.value === role)?.label ?? role

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <main className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1>User Management</h1>
          <p>Create and manage system user accounts. Admin access only.</p>
        </div>
        <button onClick={() => setShowForm(prev => !prev)}>
          {showForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {error && <p className="error-text" style={{ marginBottom: '12px' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green', marginBottom: '12px' }}>✓ {successMsg}</p>}

      {/* Create Form */}
      {showForm && (
        <section className="card" style={{ marginBottom: '24px' }}>
          <h3>New User</h3>
          <form onSubmit={handleCreate} className="stack-form">
            <div className="grid two-up">
              <label>Username *
                <input name="username" value={form.username} onChange={handleChange} required placeholder="e.g. gate_ramesh" />
              </label>
              <label>Full Name *
                <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Ramesh Kumar" />
              </label>
              <label>Email *
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="ramesh@drdo.gov.in" />
              </label>
              <label>Password *
                <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={4} placeholder="Min 4 characters" />
              </label>
              <label>Role *
                <select name="role" value={form.role} onChange={handleChange}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </label>
              <label>Active
                <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} style={{ width: 'auto', marginTop: '8px' }} />
              </label>
            </div>
            <button type="submit">Create User</button>
          </form>
        </section>
      )}

      {/* Users Table */}
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ background: 'var(--surface-alt)' }}>
            <tr>
              {['Username', 'Full Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>Loading users...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
            )}
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{user.username}</td>
                <td style={{ padding: '10px 12px' }}>{user.full_name}</td>
                <td style={{ padding: '10px 12px' }}>{user.email}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${user.role === 'admin' ? 'badge-red' : 'badge-green'}`}>
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>{formatDate(user.created_at)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="secondary-button"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => toggleActive(user)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="secondary-button"
                      style={{ fontSize: '11px', padding: '3px 8px', color: 'red', borderColor: 'red' }}
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}