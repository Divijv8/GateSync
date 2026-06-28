import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios.js'
import PassCard from '../components/PassCard.jsx'

export default function PassDetails() {
  const { passId } = useParams()
  const navigate = useNavigate()
  const [passData, setPassData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/passes/${passId}`)
      .then(res => setPassData(res.data))
      .catch(() => setError('Pass not found.'))
  }, [passId])

  if (error) return (
    <main className="page-shell">
      <h1>Pass Details</h1>
      <p className="error-text">{error}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </main>
  )

  if (!passData) return (
    <main className="page-shell">
      <p>Loading pass details...</p>
    </main>
  )

  return (
    <main className="page-shell">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h1>Pass Details</h1>
        <button onClick={() => window.print()} className="secondary-button">
          🖨 Print Pass
        </button>
        <button onClick={() => navigate(-1)} className="secondary-button">
          ← Back
        </button>
      </div>
      <PassCard passData={passData} />
    </main>
  )
}