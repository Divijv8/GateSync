import { useState } from 'react'
import api from '../api/axios.js'

const REPORTS = [
  {
    id: 'summary',
    title: 'Summary Report',
    description: 'Overall system statistics — total visitors, passes, blacklist entries, and users.',
    endpoint: '/reports/summary.pdf',
    filename: 'gatesync-summary.pdf',
  },
  {
    id: 'visitors',
    title: 'Visitor Log Report',
    description: 'Complete list of all registered visitors with their details and registration dates.',
    endpoint: '/reports/visitors.pdf',
    filename: 'gatesync-visitors.pdf',
  },
  {
    id: 'audit',
    title: 'Audit Log Report',
    description: 'Last 100 system events — logins, pass issuance, entry/exit logs, blacklist actions.',
    endpoint: '/reports/audit.pdf',
    filename: 'gatesync-audit.pdf',
  },
]

export default function Reports() {
  const [loading, setLoading] = useState({})
  const [error, setError] = useState('')

  async function downloadReport(endpoint, filename, id) {
    setError('')
    setLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await api.get(endpoint, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to generate report. Try again.')
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <main className="page-shell">
      <h1>Reports</h1>
      <p>Generate and download PDF reports for audit and administrative purposes.</p>

      {error && <p className="error-text" style={{ marginBottom: '12px' }}>{error}</p>}

      <div className="grid two-up">
        {REPORTS.map(report => (
          <section key={report.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h3 style={{ marginBottom: '6px' }}>{report.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{report.description}</p>
            </div>
            <button
              onClick={() => downloadReport(report.endpoint, report.filename, report.id)}
              disabled={loading[report.id]}
              style={{ marginTop: 'auto' }}
            >
              {loading[report.id] ? 'Generating...' : '⬇ Download PDF'}
            </button>
          </section>
        ))}
      </div>
    </main>
  )
}