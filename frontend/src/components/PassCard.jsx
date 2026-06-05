export default function PassCard({ passData }) {
  return (
    <div className="pass-card">
      <div className="pass-card-header">
        <span className="badge">Active Pass</span>
        <strong>{passData?.pass_code ?? 'PASS-0000'}</strong>
      </div>
      <div className="pass-card-body">
        <div>
          <p><strong>Visitor:</strong> {passData?.visitor?.first_name ?? 'Visitor'} {passData?.visitor?.last_name ?? ''}</p>
          <p><strong>Company:</strong> {passData?.visitor?.company ?? '—'}</p>
          <p><strong>Purpose:</strong> {passData?.visitor?.purpose ?? '—'}</p>
          <p><strong>Expires:</strong> {passData?.expires_at ?? '—'}</p>
        </div>
        <div className="qr-placeholder">
          {passData?.qr_code_url ? <img src={`http://localhost:8000${passData.qr_code_url}`} alt="Pass QR code" /> : <span>QR</span>}
        </div>
      </div>
    </div>
  )
}
