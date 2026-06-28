import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

export default function VisitorHistory() {
  const navigate = useNavigate()
  const [visitors, setVisitors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/visitors')
      .then(res => setVisitors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = visitors.filter(v => {
    const q = search.toLowerCase()
    return (
      v.first_name?.toLowerCase().includes(q) ||
      v.last_name?.toLowerCase().includes(q) ||
      v.company?.toLowerCase().includes(q) ||
      v.purpose?.toLowerCase().includes(q) ||
      v.phone?.includes(q)
    )
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <main className="page-shell">
      <h1>Visitor History</h1>
      <p>All registered visitors and their details.</p>

      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search by name, company, purpose, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      {loading && <p>Loading visitors...</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No visitors found.</p>
      )}

      {!loading && filtered.length > 0 && (
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: 'var(--surface-alt)' }}>
              <tr>
                {['Name', 'Phone', 'Company', 'Purpose', 'Host', 'Blood Grp', 'Registered', 'Passes'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr
                  key={v.id}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => navigate(`/visitors/${v.id}`)}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                    {v.first_name} {v.last_name}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{v.phone ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{v.company ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{v.purpose ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{v.host_name ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{v.blood_group ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{formatDate(v.created_at)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-green">
                      {v.passes?.length ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}