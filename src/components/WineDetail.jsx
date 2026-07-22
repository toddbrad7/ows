import { useState, useEffect } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { getAgingAnalysis } from '../lib/claude.js'
import { dStatus, dLabel, COLOR_HEX, CY, WSET_5, WSET_BODY, WSET_SWEETNESS, wsetPct } from '../lib/presets.js'
import ConsumeModal from './ConsumeModal.jsx'

export default function WineDetail({ wine: initial, onClose, onEdit }) {
  const { wines, updateWine } = useCellar()
  const wine = wines.find(w => w.id === initial.id) || initial

  const [tab,       setTab]       = useState('overview')
  const [aging,     setAging]     = useState(null)
  const [agingLoad, setAgingLoad] = useState(false)
  const [agingErr,  setAgingErr]  = useState('')
  const [consume,   setConsume]   = useState(false)

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const ds  = dStatus(wine)
  const bg  = COLOR_HEX[wine.color] || '#6b1d1d'
  const tlS = Math.min(wine.drinkStart || CY, CY) - 1
  const tlE = (wine.drinkEnd || CY + 10) + 2
  const span = tlE - tlS
  const pct  = yr => Math.max(0, Math.min(100, ((yr - tlS) / span) * 100))
  const peak = wine.drinkPeak || Math.round(((wine.drinkStart || CY) + (wine.drinkEnd || CY + 5)) / 2)

  const loadAging = async () => {
    if (aging || agingLoad) return
    setAgingLoad(true); setAgingErr('')
    try { setAging(await getAgingAnalysis(wine)) }
    catch (e) { setAgingErr(e.message) }
    finally { setAgingLoad(false) }
  }

  const handleTabChange = t => { setTab(t); if (t === 'aging') loadAging() }

  return (
    <>
      <div className="backdrop" onClick={onClose} aria-hidden />
      <aside className="panel" role="dialog" aria-modal>

        {/* Header */}
        <div className="p-hdr" style={{ background: bg }}>
          <div className="p-btl" style={{ background: `linear-gradient(${bg} 0 22%,rgba(255,255,255,.18) 22% 36%,${bg} 36% 100%)` }} />
          <div className="p-hdr-txt">
            <div className="p-eye">{wine.color} · {wine.region}</div>
            <div className="p-title">{wine.name}</div>
            {wine.vintage && <div className="p-vin">{wine.vintage}</div>}
            <div className="p-badges">
              <span className={`badge b-${ds}`}>{dLabel(wine)}</span>
              {wine.style && <span className="badge b-sty">{wine.style}</span>}
              {wine.rating > 0 && <span className="badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.25)' }}>{'★'.repeat(Math.round(wine.rating || 0))} {wine.rating}</span>}
            </div>
          </div>
          <button className="p-close" onClick={onClose}>✕</button>
        </div>

        {/* Stats */}
        <div className="p-stats">
          <div className="pstat">
            <strong>{wine.qty ?? 0}</strong><span>bottles</span>
            <div className="qty-ctrl">
              <button onClick={() => updateWine(wine.id, { qty: Math.max(0, (wine.qty || 0) - 1) })} disabled={!wine.qty}>−</button>
              <button onClick={() => updateWine(wine.id, { qty: (wine.qty || 0) + 1 })}>+</button>
            </div>
          </div>
          <div className="pstat"><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(wine.price||0)}</strong><span>per bottle</span></div>
          <div className="pstat"><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((wine.price||0)*(wine.qty||0))}</strong><span>cellar value</span></div>
          <div className="pstat"><strong style={{ fontSize: '.8rem' }}>{wine.storageLocation || '—'}</strong><span>location</span></div>
        </div>

        {/* Tabs */}
        <div className="p-tabs">
          {['overview', 'aging', 'provenance'].map(t => (
            <button key={t} className={`p-tab${tab === t ? ' active' : ''}`} onClick={() => handleTabChange(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-body">
          {tab === 'overview' && (
            <div className="tab-c">
              {/* Drink window */}
              <div className="p-sec">
                <div className="sec-label">Drink Window</div>
                <div className="tw-trk">
                  <div className="tw-early" style={{ width: `${pct(wine.drinkStart || CY)}%` }} />
                  <div className="tw-late"  style={{ width: `${100 - pct(wine.drinkEnd || CY + 10)}%` }} />
                  <div className="tw-win"   style={{ left: `${pct(wine.drinkStart || CY)}%`, right: `${100 - pct(wine.drinkEnd || CY + 10)}%` }} />
                  <div className="tw-peak"  style={{ left: `${pct(peak)}%` }}><span className="pk-lbl">Peak {peak}</span></div>
                  <div className="tw-now"   style={{ left: `${pct(CY)}%` }}><span className="now-lbl">Now</span></div>
                </div>
                <div className="tw-lbls"><span>{tlS}</span><span>{wine.drinkStart}–{wine.drinkEnd}</span><span>{tlE}</span></div>
                <p className="drink-sum">
                  {ds === 'now'  && `Drinking well now through ${wine.drinkEnd}.`}
                  {ds === 'hold' && `Hold until ${wine.drinkStart} — ${(wine.drinkStart || CY) - CY}yr away.`}
                  {ds === 'past' && 'Past recommended peak. Consider opening soon.'}
                </p>
              </div>

              {/* Tasting profile */}
              {(wine.intensityWset || wine.bodyWset || wine.tanninWset || wine.acidWset || wine.sweetnessWset) && (
                <div className="p-sec">
                  <div className="sec-label">Tasting Profile <span className="muted" style={{ fontWeight: 400, textTransform: 'none' }}>(WSET scale)</span></div>
                  <div className="pbars">
                    {[
                      { l: 'Sweetness', v: wine.sweetnessWset, scale: WSET_SWEETNESS },
                      { l: 'Intensity', v: wine.intensityWset, scale: WSET_5 },
                      { l: 'Body',      v: wine.bodyWset,      scale: WSET_BODY },
                      { l: 'Acidity',   v: wine.acidWset,      scale: WSET_5 },
                      { l: 'Tannin',    v: wine.tanninWset,    scale: WSET_5 },
                    ].filter(x => x.v).map(({ l, v, scale }) => (
                      <div key={l} className="pbar-row">
                        <span className="pbar-lbl">{l}</span>
                        <div className="pbar-trk"><div className="pbar-fil" style={{ width: `${wsetPct(scale, v)}%` }} /></div>
                        <span className="pbar-ends"><em>{v}</em></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {wine.abv && (
                <div className="p-sec"><div className="sec-label">ABV</div><p style={{ fontSize: '.9rem' }}>{wine.abv}%</p></div>
              )}

              {wine.notes  && <div className="p-sec"><div className="sec-label">Tasting Notes</div><p className="d-notes">{wine.notes}</p></div>}
              {wine.food   && <div className="p-sec"><div className="sec-label">Food Pairing</div><div className="food-pills">{wine.food.split(',').map(f => <span key={f} className="food-pill">{f.trim()}</span>)}</div></div>}
              {wine.grapes && <div className="p-sec"><div className="sec-label">Grape Varieties</div><p style={{ fontSize: '.86rem' }}>{wine.grapes}</p></div>}
            </div>
          )}

          {tab === 'aging' && (
            <div className="tab-c">
              {agingLoad && <div className="aging-load"><div className="spin" /><p style={{ fontSize: '.9rem' }}>Claude is analysing aging potential…</p></div>}
              {agingErr  && <div className="ferr">{agingErr}</div>}
              {!aging && !agingLoad && !agingErr && (
                <div className="aging-prompt">
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔬</div>
                  <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: 14 }}>Get AI aging analysis — drink window refinement, maturity state, tertiary note projections and storage advice.</p>
                  <button className="btn btn-p" onClick={loadAging}>Analyse Aging Potential</button>
                  <p className="muted" style={{ marginTop: 8, fontSize: '.75rem' }}>Powered by Claude · ~5 seconds</p>
                </div>
              )}
              {aging && (
                <>
                  <div className="p-sec">
                    <div className="sec-label">AI Aging Analysis</div>
                    <div className="aging-meta">
                      {[['Drink window', `${aging.drinkStart}–${aging.drinkEnd}`], ['Peak year', aging.peakYear], ['State', (aging.maturityState || '').replace('-', ' ')], ['Confidence', `${aging.confidenceScore}/100`]].map(([l, v]) => (
                        <div key={l} className="am-item"><span>{l}</span><strong>{v}</strong></div>
                      ))}
                    </div>
                    <p className="d-notes">{aging.agingRationale}</p>
                  </div>
                  <div className="p-sec">
                    <div className="sec-label">Projected Tertiary Notes</div>
                    <div className="ter-grid">
                      {[{ k: 'plus3', yr: CY + 3 }, { k: 'plus5', yr: CY + 5 }, { k: 'plus10', yr: CY + 10 }].map(({ k, yr }) => {
                        const inW = yr >= (aging.drinkStart || 0) && yr <= (aging.drinkEnd || 9999)
                        return (
                          <div key={k} className={`ter-card${inW ? ' inwin' : ''}`}>
                            <div className="ter-yr">+{yr - CY}yrs ({yr})</div>
                            <div className="ter-n">{aging.tertiaryNotes?.[k] || '—'}</div>
                            {inW && <div className="ter-badge">✓ In window</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {aging.storageNote && <div className="p-sec"><div className="sec-label">Storage Advice</div><p className="d-notes">{aging.storageNote}</p></div>}
                </>
              )}
            </div>
          )}

          {tab === 'provenance' && (
            <div className="tab-c">
              <div className="p-sec">
                <div className="sec-label">Origin</div>
                <div className="prov-rows">
                  {[['Region', wine.region], ['Subregion', wine.subregion], ['Producer', wine.producer], ['Winemaker', wine.winemaker], ['Varietal', wine.varietal], ['Blend', wine.grapes]].filter(([, v]) => v).map(([l, v]) => (
                    <div key={l} className="prov-row"><span>{l}</span><strong>{v}</strong></div>
                  ))}
                </div>
              </div>
              {wine.teamBio && <div className="p-sec"><div className="sec-label">About the Producer</div><p className="d-notes">{wine.teamBio}</p></div>}
              <div className="p-sec"><div className="sec-label">Storage</div><p style={{ fontSize: '.88rem' }}>{wine.storageLocation || <span className="muted">Not assigned — edit wine to set.</span>}</p></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-foot">
          <button className="btn-g" style={{ background: '#fff3cd', borderColor: '#e8d380', color: '#7a5e10' }} onClick={() => setConsume(true)} disabled={!wine.qty}>🍷 Open a Bottle</button>
          <div style={{ display: 'flex', gap: 7 }}>
            <button className="btn btn-s" style={{ padding: '8px 14px', fontSize: '.85rem' }} onClick={() => onEdit(wine)}>Edit</button>
            <button className="btn btn-p" style={{ padding: '8px 14px', fontSize: '.85rem' }} onClick={onClose}>Done</button>
          </div>
        </div>
      </aside>

      {consume && <ConsumeModal wine={wine} onClose={() => setConsume(false)} />}
    </>
  )
}
