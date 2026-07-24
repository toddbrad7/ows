import { useCellar } from '../hooks/useCellar.jsx'
import RadarChart from '../components/RadarChart.jsx'
import { computeTasteProfile, LIKED_RATING_THRESHOLD } from '../lib/presets.js'

export default function TastingHistory() {
  const { events } = useCellar()
  const profile = computeTasteProfile(events)
  const excludedCount = events.filter(e => e.rating && e.rating < LIKED_RATING_THRESHOLD).length

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
            <div className="sec-label">Your Palate Profile</div>
            <p className="muted" style={{ fontSize: '.86rem', lineHeight: 1.6 }}>
              Built from <strong>{profile.sampleSize}</strong> wine{profile.sampleSize !== 1 ? 's' : ''} you rated {LIKED_RATING_THRESHOLD}★ or higher — using Body, Tannin, Acidity, Sweetness, and Intensity on the WSET scale.
              {excludedCount > 0 && <> {excludedCount} wine{excludedCount !== 1 ? 's' : ''} rated below {LIKED_RATING_THRESHOLD}★ {excludedCount !== 1 ? 'were' : 'was'} intentionally excluded — they tell us what you don't like, not what to recommend more of.</>}
            </p>
            <p className="muted" style={{ fontSize: '.8rem', marginTop: 8 }}>This exact profile feeds your AI Sommelier and Recommendations — so you won't be pointed toward wines that clash with what you've actually enjoyed.</p>
          </div>
        </div>
      )}

      {!profile && events.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="muted">No wines rated {LIKED_RATING_THRESHOLD}★ or higher yet — rate a few tastings you enjoyed to build your palate profile.</p>
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
