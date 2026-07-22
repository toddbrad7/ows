import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { updateProfile } from '../lib/db.js'
import { getRecommendations } from '../lib/claude.js'
import { COLOR_HEX, REC_TYPES } from '../lib/presets.js'

export default function Recommendations() {
  const { wines, events } = useCellar()
  const { profile, reloadProfile } = useAuth()
  const [active, setActive] = useState(null)
  const [recs,   setRecs]   = useState([])
  const [loading,setLoading]= useState(false)
  const [error,  setError]  = useState('')
  const [fb,     setFb]     = useState({})
  const [budget, setBudget] = useState(profile?.budgetPerBottle ?? 75)
  const [savingBudget, setSavingBudget] = useState(false)

  const fetch_ = async type => {
    setActive(type); setRecs([]); setError(''); setLoading(true)
    try { setRecs(await getRecommendations(wines, events, type, profile)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const saveBudget = async () => {
    setSavingBudget(true)
    try { await updateProfile({ budgetPerBottle: +budget }); await reloadProfile() }
    finally { setSavingBudget(false) }
  }

  const cur = REC_TYPES.find(t => t.id === active)

  return (
    <div>
      <div className="hero"><div><div className="eyebrow">AI Sommelier</div><h1 className="pg-title">Recommendations</h1><p className="pg-sub">Claude analyses your cellar and taste profile.</p></div></div>

      <div className="card" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label className="flabel" style={{ maxWidth: 220 }}>
          <span>Typical budget per bottle ($)</span>
          <input className="inp" type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} />
        </label>
        <button className="btn btn-s" style={{ marginTop: 20 }} onClick={saveBudget} disabled={savingBudget}>{savingBudget ? 'Saving…' : 'Save Budget'}</button>
        <p className="muted" style={{ fontSize: '.78rem', marginTop: 20 }}>Recommendations respect this budget. Wine availability isn't tracked yet.</p>
      </div>

      {wines.length < 2 && <div style={{ background: '#fff8e0', border: '1px solid #e8d380', borderRadius: 11, padding: '11px 15px', display: 'flex', gap: 9, alignItems: 'center', marginBottom: 18, fontSize: '.86rem', color: '#7a5e10' }}><span>💡</span><p>Add a few wines first for personalised recommendations.</p></div>}
      <div className="rec-types">
        {REC_TYPES.map(t => (
          <button key={t.id} className={`rec-tc${active === t.id ? ' act' : ''}`} onClick={() => fetch_(t.id)}>
            <span className="rec-ico">{t.icon}</span><strong>{t.label}</strong><span className="rec-tc-desc">{t.desc}</span>
          </button>
        ))}
      </div>
      {loading && <div className="recs-load"><div className="spin" /><div><p style={{ fontWeight: 600 }}>Claude is analysing your cellar…</p><small style={{ color: 'var(--muted)' }}>Matching taste profile to regions, producers and vintages.</small></div></div>}
      {error && <div className="ferr" style={{ marginTop: 16 }}>⚠️ {error}</div>}
      {!loading && recs.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.15rem' }}>{cur?.icon} {cur?.label}</h2>
            <button className="btn-g" onClick={() => fetch_(active)}>↻ Refresh</button>
          </div>
          <div className="rec-list">
            {recs.map((r, i) => (
              <div key={i} className="rec-card">
                <div className="rec-l">
                  <div className="rec-num">{i + 1}</div>
                  <div className="rec-dot" style={{ background: COLOR_HEX[r.color] || '#7b1e22' }} />
                </div>
                <div className="rec-b">
                  <div className="rec-nm-row">
                    <div><strong className="rec-nm">{r.name}</strong>{r.vintage && r.vintage !== 'NV' && <span className="vtag" style={{ marginLeft: 6 }}>{r.vintage}</span>}</div>
                    <div className="rec-scores">
                      {r.withinProfile === true  && <span className="sc-pill sc-m">✓ Within Your Profile</span>}
                      {r.withinProfile === false && <span className="sc-pill sc-a">🧭 Outside Your Profile</span>}
                      {r.matchScore > 0    && <span className="sc-pill sc-m">🎯 {r.matchScore}</span>}
                      {r.adventureScore > 0 && <span className="sc-pill sc-a">🧭 {r.adventureScore}</span>}
                    </div>
                  </div>
                  <div className="rec-meta">{r.color} · {r.varietal} · {r.region}{r.drinkWindow ? ` · Drink ${r.drinkWindow}` : ''}{r.priceRange ? ` · ${r.priceRange}` : ''}</div>
                  <p className="rec-reason">{r.reason}</p>
                  <div className="fb-row">
                    <span className="muted" style={{ fontSize: '.75rem' }}>Helpful?</span>
                    {[{ k: 'liked', e: '👍' }, { k: 'saved', e: '🔖' }, { k: 'no', e: '👎' }].map(f => (
                      <button key={f.k} className={`fb-btn${fb[i] === f.k ? ' on' : ''}`} onClick={() => setFb(x => ({ ...x, [i]: f.k }))}>{f.e}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.73rem', color: 'var(--muted)', textAlign: 'center', padding: '7px 0' }}>Recommendations powered by Claude AI · Prices and availability vary</p>
        </div>
      )}
    </div>
  )
}
