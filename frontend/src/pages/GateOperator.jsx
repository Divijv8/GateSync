import { useState, useEffect } from 'react'
import api from '../api/axios.js'

export default function GateOperator() {
  const [mode, setMode] = useState('manual')
  const [passCode, setPassCode] = useState('')
  const [passData, setPassData] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    fetchRecentLogs()
    const interval = setInterval(fetchRecentLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchRecentLogs() {
    try {
      const res = await api.get('/gate/activity')
      setRecentLogs(res.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function lookupPass() {
    if (!passCode.trim()) { setError('Enter a pass code.'); return }
    setError('')
    setPassData(null)
    setSuccessMsg('')
    setLoading(true)
    try {
      const res = await api.get(`/passes/code/${passCode.trim().toUpperCase()}`)
      setPassData(res.data)
    } catch {
      setError('Pass not found. Check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function logAction(action) {
    setError('')
    setSuccessMsg('')
    try {
      await api.post(`/gate/${action}`, { pass_code: passCode.trim().toUpperCase() })
      setSuccessMsg(`${action === 'entry' ? 'Entry' : 'Exit'} logged successfully for ${passData?.visitor?.first_name} ${passData?.visitor?.last_name}.`)
      setPassCode('')
      setPassData(null)
      fetchRecentLogs()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log action.')
    }
  }

  const isExpired = passData?.expires_at && new Date(passData.expires_at) < new Date()
  const isRevoked = passData?.status === 'revoked'

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Expiry'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <main className="page-shell">
      <h1>Gate Operator</h1>
      <p>Look up a pass by code to log entry or exit.</p>

      {/* Mode Toggle */}
      <div className="toggle-row" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className={mode === 'manual' ? 'active' : 'secondary-button'}
          onClick={() => setMode('manual')}
        >
          ⌨ Manual Entry
        </button>
        <button
          type="button"
          className={mode === 'scan' ? 'active' : 'secondary-button'}
          onClick={() => setMode('scan')}
        >
          📷 QR Scan
        </button>
      </div>

      {/* Input Area */}
      <section className="card" style={{ marginBottom: '16px' }}>
        {mode === 'manual' ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <label style={{ flex: 1 }}>
              Pass Code
              <input
                value={passCode}
                onChange={e => setPassCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupPass()}
                placeholder="e.g. TV-0001, IN-0003"
                style={{ textTransform: 'uppercase' }}
              />
            </label>
            <button onClick={lookupPass} disabled={loading}>
              {loading ? 'Looking up...' : 'Look Up Pass'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
              Camera scan coming soon. Use manual entry for now.
            </p>
            <button onClick={() => setMode('manual')} className="secondary-button">
              Switch to Manual Entry
            </button>
          </div>
        )}
      </section>

      {/* Error / Success */}
      {error && <p className="error-text" style={{ marginBottom: '12px' }}>{error}</p>}
      {successMsg && (
        <p style={{ color: 'green', marginBottom: '12px', fontWeight: 500 }}>
          ✓ {successMsg}
        </p>
      )}

      {/* Pass Info Card */}
      {passData && (
        <section className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Pass: {passData.pass_code}</h3>
            <span className={`badge ${isRevoked || isExpired ? 'badge-red' : 'badge-green'}`}>
              {isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
            </span>
          </div>

          <div className="pass-grid">
            <div className="pass-field">
              <span className="pass-field-label">Visitor Name</span>
              <span className="pass-field-value">
                {passData.visitor?.first_name} {passData.visitor?.last_name}
              </span>
            </div>
            <div className="pass-field">
              <span className="pass-field-label">Company</span>
              <span className="pass-field-value">{passData.visitor?.company ?? '—'}</span>
            </div>
            <div className="pass-field">
              <span className="pass-field-label">Purpose</span>
              <span className="pass-field-value">{passData.visitor?.purpose ?? '—'}</span>
            </div>
            <div className="pass-field">
              <span className="pass-field-label">Host</span>
              <span className="pass-field-value">{passData.visitor?.host_name ?? '—'}</span>
            </div>
            <div className="pass-field">
              <span className="pass-field-label">Blood Group</span>
              <span className="pass-field-value">{passData.visitor?.blood_group ?? '—'}</span>
            </div>
            <div className="pass-field">
              <span className="pass-field-label">Valid Until</span>
              <span className="pass-field-value" style={{ color: isExpired ? 'red' : 'inherit' }}>
                {formatDate(passData.expires_at)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isRevoked && !isExpired && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => logAction('entry')} style={{ background: 'green', color: 'white', flex: 1 }}>
                ✓ Log Entry
              </button>
              <button onClick={() => logAction('exit')} style={{ background: '#b45309', color: 'white', flex: 1 }}>
                ✗ Log Exit
              </button>
            </div>
          )}

          {(isRevoked || isExpired) && (
            <p className="error-text" style={{ marginTop: '12px' }}>
              {isRevoked ? 'This pass has been revoked and cannot be used.' : 'This pass has expired and cannot be used.'}
            </p>
          )}
        </section>
      )}

      {/* Recent Activity */}
      <section className="card">
        <h3>Recent Gate Activity</h3>
        {recentLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Pass ID</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Notes</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}>#{log.pass_id}</td>
                  <td style={{ padding: '8px' }}>
                    <span className={`badge ${log.action === 'entry' ? 'badge-green' : 'badge-red'}`}>
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>{log.notes ?? '—'}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}