import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios.js'

export default function VisitorDetail() {
  const { visitorId } = useParams()
  const navigate = useNavigate()
  const [visitor, setVisitor] = useState(null)
  const [passes, setPasses] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/visitors/${visitorId}`)
      .then(res => setVisitor(res.data))
      .catch(() => setError('Visitor not found.'))

    api.get(`/visitors/${visitorId}/passes`).catch(() => {
      // fallback — fetch all passes and filter
    })
  }, [visitorId])

  // fetch passes for this visitor from pass list
  useEffect(() => {
    if (!visitor) return
    // visitor object already has passes from the list endpoint
    // but single visitor fetch may not — so we check
    if (visitor.passes) {
      setPasses(visitor.passes)
    }
  }, [visitor])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Expiry'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  if (error) return (
    <main className="page-shell">
      <h1>Visitor Detail</h1>
      <p className="error-text">{error}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </main>
  )

  if (!visitor) return (
    <main className="page-shell"><p>Loading...</p></main>
  )

  return (
    <main className="page-shell">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <button className="secondary-button" onClick={() => navigate(-1)}>← Back</button>
        <h1 style={{ margin: 0 }}>{visitor.first_name} {visitor.last_name}</h1>
      </div>

      {/* Visitor Info */}
      <section className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>Personal Details</h3>
        <div className="pass-grid">
          <div className="pass-field">
            <span className="pass-field-label">Full Name</span>
            <span className="pass-field-value">{visitor.first_name} {visitor.last_name}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Phone</span>
            <span className="pass-field-value">{visitor.phone ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Email</span>
            <span className="pass-field-value">{visitor.email ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Aadhaar</span>
            <span className="pass-field-value">
              {visitor.aadhaar_number ? 'XXXX-XXXX-' + visitor.aadhaar_number.slice(-4) : '—'}
            </span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Date of Birth</span>
            <span className="pass-field-value">{formatDate(visitor.date_of_birth)}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Blood Group</span>
            <span className="pass-field-value">{visitor.blood_group ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Para Group</span>
            <span className="pass-field-value">{visitor.para_group ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Company</span>
            <span className="pass-field-value">{visitor.company ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Purpose</span>
            <span className="pass-field-value">{visitor.purpose}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Host</span>
            <span className="pass-field-value">{visitor.host_name ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Authority</span>
            <span className="pass-field-value">{visitor.authority ?? '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Registered On</span>
            <span className="pass-field-value">{formatDate(visitor.created_at)}</span>
          </div>
        </div>
      </section>

      {/* Passes */}
      <section className="card">
        <h3 style={{ marginBottom: '12px' }}>Access Passes ({passes.length})</h3>
        {passes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No passes issued for this visitor.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: 'var(--surface-alt)' }}>
              <tr>
                {['Pass Code', 'Status', 'Issued On', 'Valid Until', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passes.map(p => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date()
                const isRevoked = p.status === 'revoked'
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>
                      {p.pass_code}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${isRevoked || isExpired ? 'badge-red' : 'badge-green'}`}>
                        {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{formatDate(p.issued_at)}</td>
                    <td style={{ padding: '10px 12px' }}>{formatDate(p.expires_at)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        className="secondary-button"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => navigate(`/passes/${p.id}`)}
                      >
                        View Pass
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}