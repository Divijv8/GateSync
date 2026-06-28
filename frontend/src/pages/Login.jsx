import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const user = await login(username, password)
      const role = user.user?.role ?? user.role ?? 'employee'
      navigate(role === 'admin' ? '/admin' : role === 'gate_operator' ? '/gate' : '/employee', { replace: true })
    } catch {
      setError('Invalid credentials. Try admin/admin123, employee/employee123, or gate/gate123.')
    }
  }

  return (
    <main className="auth-layout">
      <section className="hero-panel">
        <span className="eyebrow">Visitor access workflow</span>
        <h1>One system for registration, passes, gates, and reporting.</h1>
        <p>
          Manage visitor intake, issue coded access passes, and record gate activity from a single dashboard.
        </p>
      </section>
      <section className="card form-card">
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  )
}
