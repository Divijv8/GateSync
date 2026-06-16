import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

export default function Users() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'gate_operator',
    is_active: true,
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'gate_operator', label: 'Gate Guard' },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        username: form.username,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        is_active: form.is_active,
      }
      await api.post('/users', payload)
      setSuccess('User created successfully')
      setForm({ username: '', full_name: '', email: '', password: '', role: 'gate_operator', is_active: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user')
    }
  }

  return (
    <main className="page-shell">
      <h1>User Management</h1>
      <p>Create new profiles (admin only). Gate Guard is listed as "Gate Guard".</p>

      <section className="card small">
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>

          <label>
            Full name
            <input name="full_name" value={form.full_name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} type="email" required />
          </label>

          <label>
            Password
            <input name="password" value={form.password} onChange={handleChange} type="password" required minLength={4} />
          </label>

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Active
            <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
          </label>

          <div style={{ marginTop: 12 }}>
            <button type="submit">Create Profile</button>
            <button type="button" onClick={() => navigate('/admin')} style={{ marginLeft: 8 }}>
              Back
            </button>
          </div>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </section>
    </main>
  )
}
