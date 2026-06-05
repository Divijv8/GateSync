import { useState } from 'react'
import QRScanner from '../components/QRScanner.jsx'

export default function GateOperator() {
  const [scannedValue, setScannedValue] = useState('')
  const [mode, setMode] = useState('scan')

  return (
    <main className="page-shell">
      <h1>Gate Operator</h1>
      <p>Switch between camera scanning and manual entry for pass verification.</p>
      <div className="toggle-row">
        <button type="button" className={mode === 'scan' ? 'active' : ''} onClick={() => setMode('scan')}>
          QR Scan
        </button>
        <button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>
          Manual Entry
        </button>
      </div>
      {mode === 'scan' ? (
        <QRScanner onScan={setScannedValue} />
      ) : (
        <section className="card">
          <label>
            Pass ID or QR payload
            <input value={scannedValue} onChange={(event) => setScannedValue(event.target.value)} />
          </label>
        </section>
      )}
      <section className="card">
        <strong>Latest scan:</strong> {scannedValue || 'No pass scanned yet'}
      </section>
    </main>
  )
}
