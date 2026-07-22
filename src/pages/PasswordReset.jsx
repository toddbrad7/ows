import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export function ForgotPassword({ nav }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)
  const [done,  setDone]  = useState(false)

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await resetPassword(email); setDone(true) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="auth-pg">
      <div className="auth-card">
        <div className="auth-logo">🍷</div>
        <h1 className="auth-title">Reset Password</h1>
        {done ? (
          <p className="auth-sub">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
        ) : (
          <>
            <p className="auth-sub">Enter your email and we'll send you a reset link.</p>
            <form className="auth-form" onSubmit={submit}>
              <input className="inp" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
              {error && <div className="ferr">{error}</div>}
              <button className="btn btn-p full" type="submit" disabled={busy}>{busy ? '…' : 'Send Reset Link'}</button>
            </form>
          </>
        )}
        <p className="auth-tog"><button className="btn-lnk" onClick={() => nav('login')}>← Back to Sign In</button></p>
      </div>
    </div>
  )
}

export function ResetPassword({ nav }) {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const [done,     setDone]     = useState(false)

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await updatePassword(password); setDone(true) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="auth-pg">
      <div className="auth-card">
        <div className="auth-logo">🍷</div>
        <h1 className="auth-title">Set a New Password</h1>
        {done ? (
          <>
            <p className="auth-sub">Password updated.</p>
            <button className="btn btn-p full" onClick={() => nav('dashboard')}>Continue to Dashboard</button>
          </>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <input className="inp" type="password" placeholder="New password (min 6 characters)" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            {error && <div className="ferr">{error}</div>}
            <button className="btn btn-p full" type="submit" disabled={busy}>{busy ? '…' : 'Update Password'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
