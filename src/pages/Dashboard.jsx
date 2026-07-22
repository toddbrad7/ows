import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { money, totBtl, totVal, topByQty, dStatus, dLabel, colorClass, COLOR_HEX } from '../lib/presets.js'
import WineDetail from '../components/WineDetail.jsx'
import WorldMap from '../components/WorldMap.jsx'

const RING_COLORS = ['#7b1e22', '#c4922a', '#2d6e4e', '#5c3d6e']

export default function Dashboard({ nav }) {
  const { wines, events, loading, error } = useCellar()
  const [detailWine, setDetailWine] = useState(null)

  if (loading) return <div className="loading"><div className="spin" /><span>Loading your cellar…</span></div>
  if (error)   return <div className="ferr" style={{ margin: '40px 0' }}>⚠️ Could not connect to database: {error}<br /><small>Check your Supabase config in .env</small></div>

  const drinkNow   = wines.filter(w => dStatus(w) === 'now').sort((a, b) => a.drinkEnd - b.drinkEnd).slice(0, 5)
  const topRated   = [...events].filter(e => e.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
  const topVar     = topByQty(wines, 'varietal')
  const tot        = totBtl(wines) || 1
  const colorBreak = (() => {
    const c = {}
    wines.forEach(w => c[w.color] = (c[w.color] || 0) + (+w.qty || 0))
    return Object.entries(c).map(([cl, q]) => ({ cl, q, pct: Math.round(q / tot * 100) })).sort((a, b) => b.q - a.q)
  })()

  return (
    <div>
      <div className="hero">
        <div>
          <div className="eyebrow">Home</div>
          <h1 className="pg-title">Your Cellar</h1>
          <p className="pg-sub">
            {wines.length === 0
              ? 'Your cellar awaits — add your first bottle.'
              : `${totBtl(wines)} bottles · ${wines.length} wines · ${money(totVal(wines))}`}
          </p>
        </div>
        <div className="hero-acts">
          <button className="btn btn-p" onClick={() => nav('add')}>+ Add Bottle</button>
          <button className="btn btn-s" onClick={() => nav('import')}>Import</button>
        </div>
      </div>

      {wines.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">🍾</div>
          <h2>Your cellar awaits</h2>
          <p>Add your first wine or import an existing collection.</p>
          <div className="empty-acts">
            <button className="btn btn-p" onClick={() => nav('add')}>Add a Bottle</button>
            <button className="btn btn-s" onClick={() => nav('import')}>Import JSON</button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats strip */}
          <div className="stats">
            {[
              { i: '🍷', v: totBtl(wines),                                                          l: 'Bottles'      },
              { i: '🏷️', v: wines.length,                                                           l: 'Unique wines' },
              { i: '💰', v: money(totVal(wines)),                                                    l: 'Cellar value' },
              { i: '⚡', v: drinkNow.length,                                                        l: 'Drink now'    },
              { i: '📍', v: [...new Set(wines.map(w => w.region?.split(',')[0]))].filter(Boolean).length, l: 'Regions' },
            ].map(({ i, v, l }) => (
              <div key={l} className="stat">
                <span className="stat-ico">{i}</span>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>

          <div className="dash-grid">
            {/* Drink soon */}
            <div className="card">
              <div className="card-hdr">
                <h2>Drink Soon</h2>
                <button className="btn-lnk" onClick={() => nav('inventory')}>All →</button>
              </div>
              {drinkNow.length === 0
                ? <p className="muted">No wines in drinking window yet.</p>
                : drinkNow.map(w => (
                  <button key={w.id} className="wrow" onClick={() => setDetailWine(w)}>
                    <div className={`btl ${colorClass(w.color)}`} />
                    <div className="wrt">
                      <strong>{w.name}{w.vintage ? ` (${w.vintage})` : ''}</strong>
                      <span className="muted">{w.region}</span>
                    </div>
                    <div className="wrr">
                      <span className="badge b-now">{w.drinkStart}–{w.drinkEnd}</span>
                      <span className="muted">{w.qty}btl</span>
                    </div>
                  </button>
                ))
              }
            </div>

            {/* Color breakdown */}
            <div className="card">
              <div className="card-hdr"><h2>By Color</h2></div>
              {colorBreak.map(({ cl, q, pct }) => (
                <div key={cl} className="clr-row">
                  <span style={{ fontSize: '.82rem', fontWeight: 500 }}>{cl}</span>
                  <div className="clr-trk"><div className={`clr-fil ${colorClass(cl)}`} style={{ width: `${pct}%` }} /></div>
                  <span className="muted">{pct}% · {q}</span>
                </div>
              ))}
            </div>

            {/* Top rated — sourced from Tasting History, since ratings are only captured on consumption */}
            <div className="card">
              <div className="card-hdr"><h2>Top Rated</h2></div>
              {topRated.length === 0
                ? <p className="muted">Rate a wine when you consume it to see it here.</p>
                : topRated.map(e => (
                  <div key={e.id} className="wrow" style={{ cursor: 'default' }}>
                    <div className={`btl ${colorClass(e.wineColor)}`} />
                    <div className="wrt">
                      <strong>{e.wineName}</strong>
                      <span className="muted">{e.wineVintage} · {e.wineRegion?.split(',')[0]}</span>
                    </div>
                    <span className="stars">{'★'.repeat(Math.floor(e.rating || 0))}</span>
                  </div>
                ))}
            </div>

            {/* Top varietals rings */}
            <div className="card">
              <div className="card-hdr"><h2>Top Varietals</h2></div>
              <div className="rings">
                {topVar.map(([v, q], i) => {
                  const pct = Math.round(q / tot * 100)
                  return (
                    <div key={v} className="ring-w">
                      <svg viewBox="0 0 36 36" className="ring-svg">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e7ddd0" strokeWidth="3.2" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={RING_COLORS[i % 4]} strokeWidth="3.2"
                          strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="25" />
                      </svg>
                      <span className="ring-pct">{pct}%</span>
                      <span className="ring-lbl">{v.split(' ')[0]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* World map — one pin per wine, by origin coordinates */}
            <div className="card dash-full">
              <div className="card-hdr"><h2>Your Wines Around the World</h2></div>
              <WorldMap wines={wines} />
            </div>

            {/* Regional summary */}
            <div className="card dash-full">
              <div className="card-hdr"><h2>Regional Summary</h2></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(wines.reduce((a, w) => {
                  const r = w.region?.split(',')[0]?.trim() || 'Unknown'
                  a[r] = (a[r] || 0) + (+w.qty || 0)
                  return a
                }, {})).sort((a, b) => b[1] - a[1]).map(([region, qty]) => (
                  <span key={region} className="badge b-sty">{region} · {qty}btl</span>
                ))}
              </div>
            </div>

            {/* Recent tastings */}
            {events.length > 0 && (
              <div className="card dash-full">
                <div className="card-hdr">
                  <h2>Recent Tastings</h2>
                  <button className="btn-lnk" onClick={() => nav('history')}>All →</button>
                </div>
                {events.slice(0, 3).map(e => (
                  <div key={e.id} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--line2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={{ fontSize: '.9rem' }}>{e.wineName} {e.wineVintage || ''}</strong>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {e.rating ? <span className="stars">{'★'.repeat(e.rating)}</span> : null}
                        <span className="muted">{e.tastedAt}</span>
                      </div>
                    </div>
                    {e.notes && <p style={{ fontSize: '.82rem', color: 'var(--ink2)', fontStyle: 'italic', marginTop: 3 }}>{e.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {detailWine && (
        <WineDetail
          wine={wines.find(w => w.id === detailWine.id) || detailWine}
          onClose={() => setDetailWine(null)}
          onEdit={w => { nav('edit', w); setDetailWine(null) }}
        />
      )}
    </div>
  )
}
