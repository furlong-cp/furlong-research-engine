import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    setErrors(next)
    if (Object.keys(next).length === 0) navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <aside className="login-brand">
        <Link to="/" className="logo"><span className="logo-mark" />Furlong</Link>
        <h1>Research workspace</h1>
        <p>Inspect experiments, replay market events and review benchmark results.</p>
        <p className="note">
          <span className="badge badge-simulated">Prototype</span>
        </p>
        <p className="small">
          This form is a visual prototype only. It does not authenticate anyone, and the dashboard
          route is not protected. Real access control needs server-side authentication or a trusted
          identity provider.
        </p>
      </aside>

      <main className="login-form-wrap">
        <form className="card login-card" onSubmit={handleSubmit} noValidate>
          <h2>Sign in</h2>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" className="input" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : undefined}
            />
            {errors.email && <p id="email-err" className="error-text" role="alert">{errors.email}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" className="input" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password} aria-describedby={errors.password ? 'pw-err' : undefined}
            />
            {errors.password && <p id="pw-err" className="error-text" role="alert">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary full">Sign in</button>
          <p className="back"><Link to="/">← Back to homepage</Link></p>
        </form>
      </main>
    </div>
  )
}