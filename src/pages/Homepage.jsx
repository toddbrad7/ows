import { useState, useEffect } from 'react'
import { getSiteSettings } from '../lib/db.js'

export default function Homepage({ nav }) {
  const [settings, setSettings] = useState({
    hero_headline: 'A Society for the Serious and the Curious',
    hero_body: 'Open Wine Society is a home for people who take their cellar seriously — track every bottle, understand your own palate, and let AI point you toward what to open next.',
    hero_image_url: '',
  })

  useEffect(() => { getSiteSettings().then(setSettings).catch(() => {}) }, [])

  return (
    <div className="home-pg">
      <header className="home-topbar">
        <div className="brand">🍷 Open Wine Society</div>
        <div className="home-topbar-acts">
          <button className="btn btn-s" onClick={() => nav('login')}>Login</button>
          <button className="btn btn-p" onClick={() => nav('signup')}>Create Account</button>
        </div>
      </header>

      <section className="home-hero" style={settings.hero_image_url ? { backgroundImage: `url(${settings.hero_image_url})` } : undefined}>
        <div className="home-hero-overlay">
          <h1>{settings.hero_headline}</h1>
          <p>{settings.hero_body}</p>
          <div className="home-hero-acts">
            <button className="btn btn-p" onClick={() => nav('signup')}>Create Your Cellar</button>
            <button className="btn btn-s" onClick={() => nav('login')}>Login</button>
          </div>
        </div>
      </section>

      <section className="home-philosophy">
        <div className="home-phil-grid">
          <div className="home-phil-card">
            <div className="home-phil-ico">📖</div>
            <h3>Know Your Cellar</h3>
            <p>Every bottle, tracked — origin, drink window, storage location, and the story behind it.</p>
          </div>
          <div className="home-phil-card">
            <div className="home-phil-ico">🧬</div>
            <h3>Know Your Palate</h3>
            <p>WSET-standard tasting profiles built from what you've actually consumed, not guesswork.</p>
          </div>
          <div className="home-phil-card">
            <div className="home-phil-ico">🤖</div>
            <h3>Know What's Next</h3>
            <p>An AI sommelier that reasons over your real taste profile, your budget, and your cellar.</p>
          </div>
        </div>
      </section>

      <footer className="home-foot">
        <p>© {new Date().getFullYear()} Open Wine Society</p>
      </footer>
    </div>
  )
}
