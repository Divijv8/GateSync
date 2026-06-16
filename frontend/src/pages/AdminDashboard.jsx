import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <main className="page-shell">
      <h1>Admin Dashboard</h1>
      <p>Quick access for administrative tasks.</p>
      <div className="grid two-up">
        <section className="card">
          <h3>User provisioning</h3>
          <p>Create and manage profiles.</p>
          <Link to="/users">Manage Users</Link>
        </section>
        <section className="card">Audit log review</section>
      </div>
    </main>
  )
}
