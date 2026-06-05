export default function VisitorRegistration() {
  return (
    <main className="page-shell">
      <h1>Visitor Registration</h1>
      <p>TODO: Capture visitor details and submit them to the backend.</p>
      <section className="card">
        <form className="stack-form">
          <label>
            Full name
            <input placeholder="Visitor name" />
          </label>
          <label>
            Purpose
            <input placeholder="Meeting, delivery, interview, etc." />
          </label>
          <button type="button">Save visitor</button>
        </form>
      </section>
    </main>
  )
}
