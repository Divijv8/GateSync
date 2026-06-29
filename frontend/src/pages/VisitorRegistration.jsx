import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const DURATION_OPTIONS = {
  IN: [
    { label: '4 Weeks', days: 28 },
    { label: '6 Weeks', days: 42 },
    { label: '8 Weeks', days: 56 },
  ],
  CT: [
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
  ],
  TV: [
    { label: '1 Day', days: 1 },
    { label: '3 Days', days: 3 },
    { label: '1 Week', days: 7 },
  ],
  PE: [],
  OG: [
    { label: '1 Day', days: 1 },
    { label: '3 Days', days: 3 },
  ],
  DL: [{ label: '1 Day', days: 1 }],
  MT: [
    { label: '1 Day', days: 1 },
    { label: '1 Week', days: 7 },
  ],
  VD: [
    { label: '1 Day', days: 1 },
    { label: '3 Days', days: 3 },
    { label: '1 Week', days: 7 },
  ],
  SR: [],
  SC: [],
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function VisitorRegistration() {
  const navigate = useNavigate()
  const [passTypes, setPassTypes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    aadhaar_number: '',
    date_of_birth: '',
    blood_group: '',
    para_group: '',
    authority: '',
    company: '',
    purpose: '',
    host_name: '',
  })

  const [passTypeAbbr, setPassTypeAbbr] = useState('')
  const [durationDays, setDurationDays] = useState('')

  useEffect(() => {
    api.get('/pass-types').then(res => setPassTypes(res.data)).catch(console.error)
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const durationOptions = DURATION_OPTIONS[passTypeAbbr] ?? []
  const isPermanent = passTypeAbbr && durationOptions.length === 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!passTypeAbbr) { setError('Please select a pass type.'); return }
    if (!isPermanent && !durationDays) { setError('Please select a duration.'); return }
    if (!form.first_name || !form.last_name) { setError('First and last name are required.'); return }
    if (!form.purpose) { setError('Purpose is required.'); return }

    setLoading(true)
    try {
      // Step 1 — register visitor
      const visitorRes = await api.post('/visitors', form)
      const visitorId = visitorRes.data.id

      // Step 2 — issue pass
      const params = new URLSearchParams({ pass_type_abbr: passTypeAbbr })
      if (!isPermanent && durationDays) params.append('duration_days', durationDays)

      const passRes = await api.post(`/passes/${visitorId}?${params.toString()}`)
      const passId = passRes.data.access_pass.id

      // Step 3 — go to pass details
      navigate(`/passes/${passId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <h1>Visitor Registration</h1>
      <p>Register a new visitor and issue an access pass in one step.</p>

      <form onSubmit={handleSubmit} className="stack-form card">

        <h3>Personal Information</h3>
        <div className="grid two-up">
          <label>First Name *
            <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Rahul" />
          </label>
          <label>Last Name *
            <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Sharma" />
          </label>
          <label>Phone Number
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
          </label>
          <label>Email
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" />
          </label>
          <label>Aadhaar Number
            <input name="aadhaar_number" value={form.aadhaar_number} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} />
          </label>
          <label>Date of Birth
            <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
          </label>
          <label>Blood Group
            <select name="blood_group" value={form.blood_group} onChange={handleChange}>
              <option value="">Select</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </label>
          <label>Para Group
            <input name="para_group" value={form.para_group} onChange={handleChange} placeholder="e.g. 01" />
          </label>
        </div>

        <h3 style={{ marginTop: '24px' }}>Visit Information</h3>
          <div className="grid two-up">
          <label>Company / Organization
            <input name="company" value={form.company} onChange={handleChange} placeholder="DRDO" />
          </label>
          <label>Host Name
            <input name="host_name" value={form.host_name} onChange={handleChange} placeholder="Dr. H.K. Bansal" />
          </label>
          <label>Authority
            <input name="authority" value={form.authority} onChange={handleChange} placeholder="Director, DRDO" />
          </label>
          <label>Purpose *
            <input name="purpose" value={form.purpose} onChange={handleChange} placeholder="Training / Meeting / Inspection" />
          </label>
        </div>

        <h3 style={{ marginTop: '24px' }}>Pass Details</h3>
        <div className="grid two-up">
          <label>Pass Type *
            <select value={passTypeAbbr} onChange={e => { setPassTypeAbbr(e.target.value); setDurationDays('') }}>
              <option value="">Select pass type</option>
              {passTypes.map(pt => (
                <option key={pt.abbreviation} value={pt.abbreviation}>
                  {pt.abbreviation} — {pt.label}
                </option>
              ))}
            </select>
          </label>

          {passTypeAbbr && !isPermanent && (
            <label>Duration *
              <select value={durationDays} onChange={e => setDurationDays(e.target.value)}>
                <option value="">Select duration</option>
                {durationOptions.map(opt => (
                  <option key={opt.days} value={opt.days}>{opt.label}</option>
                ))}
              </select>
            </label>
          )}

          {isPermanent && (
            <label>Duration
              <input value="Permanent — No Expiry" disabled />
            </label>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Visitor & Issue Pass'}
        </button>

      </form>
    </main>
  )
}