import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function SignUp({ nav }) {
  const { signUp } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const [done,     setDone]     = useState(false)

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await signUp(email, password); setDone(true) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  if (done) {
    return (
      <div className="auth-pg">
        <div className="auth-card">
          <div className="auth-logo">🍷</div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.</p>
          <button className="btn btn-p full" onClick={() => nav('login')}>Go to Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-pg">
      <div className="auth-card">
        <div className="auth-logo">🍷</div>
        <h1 className="auth-title">Open Wine Society</h1>
        <p className="auth-sub">Create your account</p>
        <form className="auth-form" onSubmit={submit}>
          <input className="inp" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
          <input className="inp" type="password" placeholder="Password (min 6 characters)" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="ferr">{error}</div>}
          <button className="btn btn-p full" type="submit" disabled={busy}>{busy ? '…' : 'Create Account'}</button>
        </form>
        <p className="auth-tog">Already have an account? <button className="btn-lnk" onClick={() => nav('login')}>Sign in</button></p>
        <p className="auth-tog"><button className="btn-lnk" onClick={() => nav('home')}>← Back to homepage</button></p>
      </div>
    </div>
  )
}
