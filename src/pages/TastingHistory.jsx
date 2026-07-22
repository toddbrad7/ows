import { useCellar } from '../hooks/useCellar.jsx'
import RadarChart from '../components/RadarChart.jsx'
import { WSET_5, WSET_BODY, WSET_SWEETNESS, wsetPct } from '../lib/presets.js'

// Build a mathematical taste profile (0-100 per axis) from consumed wines' WSET scales.
function buildTasteProfile(events) {
  const withProfile = events.filter(e => e.intensityWset || e.bodyWset || e.tanninWset || e.acidWset || e.sweetnessWset)
  if (!withProfile.length) return null
  const avg = (scale, key) => {
    const vals = withProfile.map(e => e[key]).filter(Boolean).map(v => wsetPct(scale, v))
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 50
  }
  return {
    Sweetness: avg(WSET_SWEETNESS, 'sweetnessWset'),
    Intensity: avg(WSET_5, 'intensityWset'),
    Body:      avg(WSET_BODY, 'bodyWset'),
    Acidity:   avg(WSET_5, 'acidWset'),
    Tannin:    avg(WSET_5, 'tanninWset'),
  }
}

export default function TastingHistory() {
  const { events } = useCellar()
  const profile = buildTasteProfile(events)

  const byMonth = events.reduce((a, e) => {
    const m = (e.tastedAt || '').slice(0, 7) || '?'
    ;(a[m] = a[m] || []).push(e)
    return a
  }, {})

  return (
    <div>
      <div className="hero"><div><div className="eyebrow">History</div><h1 className="pg-title">Tasting History</h1><p className="pg-sub">{events.length} bottles consumed</p></div></div>

      {profile && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <RadarChart axes={[
            { label: 'Sweetness', pct: profile.Sweetness },
            { label: 'Intensity', pct: profile.Intensity },
            { label: 'Body',      pct: profile.Body },
            { label: 'Acidity',   pct: profile.Acidity },
            { label: 'Tannin',    pct: profile.Tannin },
          ]} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="sec-label">Your Taste Profile</div>
            <p className="muted" style={{ fontSize: '.86rem', lineHeight: 1.6 }}>
              Built from {events.length} tasting{events.length !== 1 ? 's' : ''} using Body, Tannin, Acidity, Sweetness, and Intensity on the WSET scale.
              Used by Recommendations to distinguish wines <strong>Within Your Profile</strong> from ones <strong>Outside Your Profile</strong>.
            </p>
          </div>
        </div>
      )}

      {events.length === 0
        ? <div className="empty"><div className="empty-ico">📖</div><h2>No tasting history yet</h2><p>Open a bottle from your inventory to start recording.</p></div>
        : Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([month, evs]) => (
          <div key={month} className="hist-mo">
            <div className="hist-mo-lbl">{month}</div>
            {evs.map(e => (
              <div key={e.id} className="hist-card">
                <div className="hist-hdr">
                  <span className="hist-wn">{e.wineName} {e.wineVintage || ''}<span className="muted" style={{ fontWeight: 400, marginLeft: 5 }}>{e.wineRegion || ''}</span></span>
                  <div className="hist-meta">
                    {e.rating ? <span className="stars">{'★'.repeat(e.rating)}</span> : null}
                    <span className="muted">{e.tastedAt}</span>
                    {e.occasion ? <span className="badge b-sty">{e.occasion}</span> : null}
                  </div>
                </div>
                {e.notes       && <p className="hist-notes">{e.notes}</p>}
                {e.foodPairing && <p className="muted" style={{ fontSize: '.8rem', marginTop: 3 }}>🍽️ {e.foodPairing}</p>}
                <div className="mini-bars">
                  {e.sweetnessPerceived > 0 && <div className="mini-bar"><span>Sweetness</span><div className="mini-trk"><div className="mini-fil" style={{ width: `${e.sweetnessPerceived}%` }} /></div></div>}
                  {e.intensityPerceived > 0 && <div className="mini-bar"><span>Intensity</span><div className="mini-trk"><div className="mini-fil" style={{ width: `${e.intensityPerceived}%` }} /></div></div>}
                </div>
              </div>
            ))}
          </div>
        ))
      }
    </div>
  )
}
