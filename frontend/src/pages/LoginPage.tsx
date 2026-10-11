import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.css'

type Errors = { name?: string; email?: string; password?: string; confirm?: string }

export default function LoginPage({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const signup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (signup && name.trim().length < 2) next.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (signup && confirm !== password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length === 0) navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <aside className="login-brand">
        <Link to="/" className="logo"><span className="logo-mark" />Furlong</Link>
        <h1>{signup ? 'Create your workspace' : 'Welcome back'}</h1>
        <p>Inspect experiments, replay market events and review benchmark results.</p>
        <p className="note"><span className="badge badge-simulated">Prototype</span></p>
        <p className="small">
          This form is a visual prototype. It does not create real accounts or authenticate anyone,
          and the dashboard route is not protected. Real access control needs server-side
          authentication. Do not enter a password you use anywhere else.
        </p>
      </aside>

      <main className="login-form-wrap">
        <form className="card login-card" onSubmit={handleSubmit} noValidate>
          <h2>{signup ? 'Sign up' : 'Log in'}</h2>

          {signup && (
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" className="input" autoComplete="name" value={name}
                onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
              {errors.name && <p className="error-text" role="alert">{errors.name}</p>}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
            {errors.email && <p className="error-text" role="alert">{errors.email}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="input"
              autoComplete={signup ? 'new-password' : 'current-password'} value={password}
              onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
            {errors.password && <p className="error-text" role="alert">{errors.password}</p>}
          </div>

          {signup && (
            <div className="form-field">
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" type="password" className="input" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={!!errors.confirm} />
              {errors.confirm && <p className="error-text" role="alert">{errors.confirm}</p>}
            </div>
          )}

          <button type="submit" className="btn btn-primary full">{signup ? 'Create account' : 'Log in'}</button>

          <p className="back">
            {signup ? <>Already have an account? <Link to="/login">Log in</Link></>
                    : <>New here? <Link to="/signup">Create an account</Link></>}
          </p>
          <p className="back"><Link to="/">← Back to homepage</Link></p>
        </form>
      </main>
    </div>
  )
}