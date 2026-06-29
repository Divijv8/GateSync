import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export default function Blacklist() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Add form state
  const [form, setForm] = useState({ full_name: '', reason: '', visitor_id: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchBlacklist()
  }, [])

  async function fetchBlacklist() {
    try {
      const res = await api.get('/blacklist')
      setEntries(res.data)
    } catch {
      setError('Failed to load blacklist.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!form.full_name || !form.reason) {
      setError('Full name and reason are required.')
      return
    }
    try {
      await api.post('/blacklist', {
        full_name: form.full_name,
        reason: form.reason,
        visitor_id: form.visitor_id ? parseInt(form.visitor_id) : null,
        is_active: true,
      })
      setSuccessMsg(`${form.full_name} added to blacklist.`)
      setForm({ full_name: '', reason: '', visitor_id: '' })
      setShowForm(false)
      fetchBlacklist()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add to blacklist.')
    }
  }

  async function handleDeactivate(id, name) {
    if (!confirm(`Deactivate blacklist entry for ${name}?`)) return
    setError('')
    try {
      await api.patch(`/blacklist/${id}`, { is_active: false })
      setSuccessMsg(`${name} removed from active blacklist.`)
      fetchBlacklist()
    } catch {
      setError('Failed to update entry.')
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Permanently delete blacklist entry for ${name}? This cannot be undone.`)) return
    setError('')
    try {
      await api.delete(`/blacklist/${id}`)
      setSuccessMsg(`${name} permanently removed.`)
      fetchBlacklist()
    } catch {
      setError('Failed to delete entry.')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const active = entries.filter(e => e.is_active)
  const inactive = entries.filter(e => !e.is_active)

  return (
    <main className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1>Blacklist</h1>
          <p>Manage blocked individuals. Blacklisted visitors cannot register or enter.</p>
        </div>
        <button onClick={() => setShowForm(prev => !prev)}>
          {showForm ? 'Cancel' : '+ Add to Blacklist'}
        </button>
      </div>

      {error && <p className="error-text" style={{ marginBottom: '12px' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green', marginBottom: '12px' }}>{successMsg}</p>}

      {/* Add Form */}
      {showForm && (
        <section className="card" style={{ marginBottom: '20px' }}>
          <h3>Add to Blacklist</h3>
          <form onSubmit={handleAdd} className="stack-form">
            <div className="grid two-up">
              <label>Full Name *
                <input
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Exact full name of the individual"
                />
              </label>
              <label>Visitor ID (optional)
                <input
                  type="number"
                  value={form.visitor_id}
                  onChange={e => setForm(p => ({ ...p, visitor_id: e.target.value }))}
                  placeholder="Link to existing visitor record"
                />
              </label>
            </div>
            <label>Reason *
              <textarea
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Reason for blacklisting..."
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: '13px' }}
              />
            </label>
            <button type="submit">Add to Blacklist</button>
          </form>
        </section>
      )}

      {/* Active Entries */}
      <section className="card" style={{ marginBottom: '20px' }}>
        <h3>Active Blacklist ({active.length})</h3>
        {loading && <p>Loading...</p>}
        {!loading && active.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No active blacklist entries.</p>
        )}
        {active.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: 'var(--surface-alt)' }}>
              <tr>
                {['Full Name', 'Reason', 'Added On', 'Visitor ID', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{entry.full_name}</td>
                  <td style={{ padding: '10px 12px', maxWidth: '250px' }}>{entry.reason}</td>
                  <td style={{ padding: '10px 12px' }}>{formatDate(entry.added_at)}</td>
                  <td style={{ padding: '10px 12px' }}>{entry.visitor_id ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="secondary-button"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => handleDeactivate(entry.id, entry.full_name)}
                      >
                        Deactivate
                      </button>
                      <button
                        className="secondary-button"
                        style={{ fontSize: '12px', padding: '4px 10px', color: 'red', borderColor: 'red' }}
                        onClick={() => handleDelete(entry.id, entry.full_name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Inactive Entries */}
      {inactive.length > 0 && (
        <section className="card">
          <h3>Deactivated Entries ({inactive.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: 'var(--surface-alt)' }}>
              <tr>
                {['Full Name', 'Reason', 'Added On'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inactive.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)', opacity: 0.6 }}>
                  <td style={{ padding: '10px 12px' }}>{entry.full_name}</td>
                  <td style={{ padding: '10px 12px' }}>{entry.reason}</td>
                  <td style={{ padding: '10px 12px' }}>{formatDate(entry.added_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}