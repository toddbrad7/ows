import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { CellarProvider } from './hooks/useCellar.jsx'
import { NAV_ITEMS } from './lib/presets.js'

import Homepage        from './pages/Homepage.jsx'
import Login           from './pages/Login.jsx'
import SignUp          from './pages/SignUp.jsx'
import { ForgotPassword, ResetPassword } from './pages/PasswordReset.jsx'
import Dashboard        from './pages/Dashboard.jsx'
import Inventory        from './pages/Inventory.jsx'
import AddBottle        from './pages/AddBottle.jsx'
import Recommendations  from './pages/Recommendations.jsx'
import Sommelier        from './pages/Sommelier.jsx'
import TastingHistory   from './pages/TastingHistory.jsx'
import StorageLocations from './pages/StorageLocations.jsx'
import ImportExport     from './pages/ImportExport.jsx'
import AdminConsole     from './pages/AdminConsole.jsx'

// Pages reachable without being signed in
const PUBLIC_PAGES = ['home', 'login', 'signup', 'forgot', 'reset-password']

function Shell() {
  const { session, user, profile, profileLoading, signOut } = useAuth()
  const [page,     setPage]     = useState(() => window.location.pathname === '/reset-password' ? 'reset-password' : 'home')
  const [editWine, setEditWine] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = (dest, wine = null) => {
    setEditWine(wine); setPage(dest); setMenuOpen(false); window.scrollTo(0, 0)
  }

  // Once a session appears (fresh login/signup), leave any public/auth page and land on the dashboard
  useEffect(() => {
    if (user && PUBLIC_PAGES.includes(page) && page !== 'reset-password') {
      setPage('dashboard')
    }
    if (!user && session === null && !PUBLIC_PAGES.includes(page)) {
      setPage('home')
    }
  }, [user, session]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Still checking for an existing session ──────────────────────────────────
  if (session === undefined) {
    return <div className="loading"><div className="spin" /><span>Loading…</span></div>
  }

  // ── Public pages (homepage, login, signup, password reset) ─────────────────
  if (!user || PUBLIC_PAGES.includes(page)) {
    switch (page) {
      case 'login':          return <Login nav={nav} />
      case 'signup':         return <SignUp nav={nav} />
      case 'forgot':         return <ForgotPassword nav={nav} />
      case 'reset-password': return <ResetPassword nav={nav} />
      default:               return <Homepage nav={nav} />
    }
  }

  // ── Authenticated app ────────────────────────────────────────────────────────
  if (profileLoading || !profile) {
    return <div className="loading"><div className="spin" /><span>Loading your account…</span></div>
  }

  const active = page === 'edit' ? 'inventory' : page
  const navItems = profile.isAdmin ? [...NAV_ITEMS, { id: 'admin', i: '🛠️', l: 'Admin Console' }] : NAV_ITEMS

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <Dashboard        nav={nav} />
      case 'inventory':  return <Inventory        nav={nav} />
      case 'add':        return <AddBottle        nav={nav} />
      case 'edit':       return <AddBottle         nav={nav} editWine={editWine} />
      case 'recs':       return <Recommendations  nav={nav} />
      case 'sommelier':  return <Sommelier />
      case 'history':    return <TastingHistory />
      case 'storage':    return <StorageLocations nav={nav} />
      case 'import':     return <ImportExport     nav={nav} />
      case 'admin':      return profile.isAdmin ? <AdminConsole /> : <Dashboard nav={nav} />
      default:           return <Dashboard        nav={nav} />
    }
  }

  return (
    <CellarProvider>
      <div className="app">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>
          <div className="brand">Open Wine Society</div>
          <div className="topbar-r">
            <span style={{ fontSize: '.85rem', opacity: .75 }}>{profile.displayName}</span>
            <button className="btn-g" onClick={signOut}>Sign out</button>
          </div>
        </header>
        <div className={`overlay${menuOpen ? ' show' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden />
        <nav className={`sidenav${menuOpen ? ' open' : ''}`}>
          <div className="snbrand">Open Wine Society</div>
          {navItems.map(n => (
            <button key={n.id} className={`navbtn${active === n.id ? ' active' : ''}`} onClick={() => nav(n.id)}>
              <span className="ni">{n.i}</span>{n.l}
            </button>
          ))}
          <button className="navbtn" onClick={() => nav('home')} style={{ marginTop: 'auto' }}>
            <span className="ni">🏠</span>View Public Homepage
          </button>
        </nav>
        <main className="main"><div className="wrap">{renderPage()}</div></main>
      </div>
    </CellarProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
