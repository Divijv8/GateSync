import { useParams } from 'react-router-dom'
import PassCard from '../components/PassCard.jsx'

export default function PassDetails() {
  const { passId } = useParams()
  const demoPass = {
    id: passId,
    pass_code: `PASS-${passId ?? '0000'}`,
    visitor: {
      first_name: 'Sample',
      last_name: 'Visitor',
      company: 'Northwind Labs',
      purpose: 'Project meeting',
    },
    expires_at: '2026-06-05T18:00:00Z',
    qr_code_url: '/static/qrcodes/sample-pass.png',
  }

  return (
    <main className="page-shell">
      <h1>Pass Details</h1>
      <p>Pass ID: {passId}</p>
      <PassCard passData={demoPass} />
    </main>
  )
}
