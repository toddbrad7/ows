import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login({ nav }) {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await signIn(email, password) } // AuthProvider handles redirect via session change
    catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="auth-pg">
      <div className="auth-card">
        <div className="auth-logo">🍷</div>
        <h1 className="auth-title">Open Wine Society</h1>
        <p className="auth-sub">Welcome back</p>
        <form className="auth-form" onSubmit={submit}>
          <input className="inp" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
          <input className="inp" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="ferr">{error}</div>}
          <button className="btn btn-p full" type="submit" disabled={busy}>{busy ? '…' : 'Sign In'}</button>
        </form>
        <p className="auth-tog"><button className="btn-lnk" onClick={() => nav('forgot')}>Forgot password?</button></p>
        <p className="auth-tog">No account? <button className="btn-lnk" onClick={() => nav('signup')}>Create one</button></p>
        <p className="auth-tog"><button className="btn-lnk" onClick={() => nav('home')}>← Back to homepage</button></p>
      </div>
    </div>
  )
}
