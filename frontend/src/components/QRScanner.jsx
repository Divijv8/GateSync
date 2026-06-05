import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onScan }) {
  const containerId = 'qr-reader'
  const scannerRef = useRef(null)
  const [manualValue, setManualValue] = useState('')

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScan(decodedText),
        () => {},
      )
      .catch(() => {
        // TODO: surface camera errors in the UI.
      })

    return () => {
      const activeScanner = scannerRef.current
      if (activeScanner?.isScanning) {
        activeScanner.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="scanner-shell">
      <div id={containerId} className="qr-camera" />
      <div className="manual-scan">
        <label htmlFor="manual-pass">Manual Pass ID</label>
        <div className="inline-row">
          <input
            id="manual-pass"
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            placeholder="Enter pass code"
          />
          <button type="button" onClick={() => onScan(manualValue)}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
