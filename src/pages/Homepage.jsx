import { useState, useEffect } from 'react'
import { getSiteSettings } from '../lib/db.js'

const DEFAULTS = {
  hero_headline: 'A Society for the Serious and the Curious',
  hero_body: 'Open Wine Society is a home for people who take their cellar seriously — track every bottle, understand your own palate, and let AI point you toward what to open next.',
  hero_image_url: '',
  phil1_icon: '📖', phil1_headline: 'Know Your Cellar', phil1_body: 'Every bottle, tracked — origin, drink window, storage location, and the story behind it.',
  phil2_icon: '🧬', phil2_headline: 'Know Your Palate', phil2_body: "WSET-standard tasting profiles built from what you've actually consumed, not guesswork.",
  phil3_icon: '🤖', phil3_headline: "Know What's Next", phil3_body: 'An AI sommelier that reasons over your real taste profile, your budget, and your cellar.',
  phil4_icon: '🍷', phil4_headline: 'Wine Club', phil4_body: 'Join our wine club for curated selections delivered to your door.', phil4_link: '',
  instagram_url: '',
}

export default function Homepage({ nav }) {
  const [settings, setSettings] = useState(DEFAULTS)

  useEffect(() => { getSiteSettings().then(s => setSettings({ ...DEFAULTS, ...s })).catch(() => {}) }, [])

  const cards = [
    { icon: settings.phil1_icon, headline: settings.phil1_headline, body: settings.phil1_body },
    { icon: settings.phil2_icon, headline: settings.phil2_headline, body: settings.phil2_body },
    { icon: settings.phil3_icon, headline: settings.phil3_headline, body: settings.phil3_body },
    { icon: settings.phil4_icon, headline: settings.phil4_headline, body: settings.phil4_body, link: settings.phil4_link },
  ]

  return (
    <div className="home-pg">
      <header className="home-topbar">
        <div className="brand">🍷 Open Wine Society</div>
        <div className="home-topbar-acts">
          {settings.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="home-social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
          )}
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
          {cards.map((c, i) => {
            const Wrapper = c.link ? 'a' : 'div'
            const wrapperProps = c.link ? { href: c.link, target: '_blank', rel: 'noopener noreferrer' } : {}
            return (
              <Wrapper key={i} className="home-phil-card" {...wrapperProps}>
                <div className="home-phil-ico">{c.icon}</div>
                <h3>{c.headline}</h3>
                <p>{c.body}</p>
                {c.link && <span className="home-phil-cta">Learn more →</span>}
              </Wrapper>
            )
          })}
        </div>
      </section>

      <footer className="home-foot">
        <p>© {new Date().getFullYear()} Open Wine Society{settings.instagram_url && <> · <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a></>}</p>
      </footer>
    </div>
  )
}
