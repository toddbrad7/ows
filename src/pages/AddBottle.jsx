import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { PRESETS, WSET_FIELDS, REGIONS, CY, WINE_COLORS } from '../lib/presets.js'

const BLANK = {
  name: '', producer: '', winemaker: '', vintage: String(CY),
  region: '', subregion: '', varietal: '', color: 'Red', style: '', grapes: '',
  qty: 1, price: 50, abv: '',
  sweetnessWset: 'Dry', intensityWset: 'Medium', bodyWset: 'Medium', acidWset: 'Medium', tanninWset: 'Medium',
  drinkStart: CY + 2, drinkEnd: CY + 10,
  notes: '', food: '', teamBio: '',
  storageLocationId: '', storageLocation: '',
  lat: null, lng: null,
}

const YEARS = Array.from({ length: 60 }, (_, i) => CY - i)

export default function AddBottle({ nav, editWine }) {
  const { addWine, updateWine, locations } = useCellar()
  const isEdit = !!editWine
  const [step,   setStep]   = useState(isEdit ? 2 : 1)
  const [form,   setForm]   = useState(isEdit ? { ...editWine } : { ...BLANK })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPreset = p => {
    setForm(f => ({ ...f, color: p.color, style: p.label, ...p.defaults }))
    setStep(2)
  }

  const handleRegion = v => {
    set('region', v)
    const key = Object.keys(REGIONS).find(k => k.toLowerCase().startsWith(v.toLowerCase().split(',')[0]))
    if (key) setForm(f => ({ ...f, region: v, lat: REGIONS[key].lat, lng: REGIONS[key].lng }))
  }

  const handleLocation = id => {
    const loc = locations.find(l => l.id === id)
    setForm(f => ({ ...f, storageLocationId: id, storageLocation: loc?.name || '' }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Wine name is required.'); return }
    setSaving(true); setError('')
    try {
      const wine = {
        ...form,
        qty: +form.qty || 0, price: +form.price || 0,
        abv: form.abv === '' ? null : +form.abv,
        drinkStart: +form.drinkStart, drinkEnd: +form.drinkEnd,
        drinkPeak: Math.round((+form.drinkStart + +form.drinkEnd) / 2),
      }
      isEdit ? await updateWine(editWine.id, wine) : await addWine(wine)
      nav('inventory')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const winPct = (yr) => Math.max(0, Math.min(100, ((yr - CY) / 40) * 100))

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">{isEdit ? 'Edit wine' : 'Add bottle'}</div>
        <h1 className="pg-title">{isEdit ? `Edit ${editWine.name}` : 'Add a Wine'}</h1>
      </div>

      {/* Step 1 — Preset picker */}
      {step === 1 && !isEdit && (
        <div className="preset-grid">
          {PRESETS.map(p => (
            <button key={p.id} className="preset-card" onClick={() => applyPreset(p)}>
              <span className="p-emoji">{p.emoji}</span>
              <strong className="p-lbl">{p.label}</strong>
              <span className="p-desc">{p.desc}</span>
            </button>
          ))}
          <button className="preset-card" style={{ borderStyle: 'dashed' }} onClick={() => setStep(2)}>
            <span className="p-emoji">✏️</span>
            <strong className="p-lbl">Enter Manually</strong>
            <span className="p-desc">Start with a blank form</span>
          </button>
        </div>
      )}

      {/* Step 2 — Form */}
      {step === 2 && (
        <div>
          {!isEdit && <button className="btn-lnk" style={{ display: 'block', marginBottom: 12 }} onClick={() => setStep(1)}>← Change preset</button>}
          {form.style && <p className="muted" style={{ marginBottom: 12 }}>Preset: <strong>{form.style}</strong> — adjust to match.</p>}

          <div className="form-secs">
            {/* The Bottle */}
            <div className="fsec">
              <div className="fsec-title">🍾 The Bottle</div>
              <div className="fgrid">
                <label className="flabel fw"><span>Wine Name *</span><input className="inp" value={form.name} placeholder="e.g. Chateau Margaux" onChange={e => set('name', e.target.value)} /></label>
                <label className="flabel"><span>Producer</span><input className="inp" value={form.producer} onChange={e => set('producer', e.target.value)} /></label>
                <label className="flabel"><span>Winemaker</span><input className="inp" value={form.winemaker} onChange={e => set('winemaker', e.target.value)} /></label>
                <label className="flabel"><span>Vintage</span>
                  <select className="inp" value={form.vintage} onChange={e => set('vintage', e.target.value)}>
                    <option value="NV">NV</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
                <label className="flabel"><span>Color</span>
                  <select className="inp" value={form.color} onChange={e => set('color', e.target.value)}>
                    {WINE_COLORS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flabel"><span>ABV (%)</span><input className="inp" type="number" step="0.1" min="0" max="25" placeholder="13.5" value={form.abv} onChange={e => set('abv', e.target.value)} /></label>
                <label className="flabel"><span>Varietal</span><input className="inp" value={form.varietal} placeholder="Cabernet Sauvignon" onChange={e => set('varietal', e.target.value)} /></label>
                <label className="flabel fw"><span>All Grapes</span><input className="inp" value={form.grapes} placeholder="Cab Sauv, Merlot, Cab Franc" onChange={e => set('grapes', e.target.value)} /></label>
              </div>
            </div>

            {/* Origin */}
            <div className="fsec">
              <div className="fsec-title">📍 Origin</div>
              <div className="fgrid">
                <label className="flabel">
                  <span>Region</span>
                  <input className="inp" list="rl" value={form.region} placeholder="Bordeaux, France" onChange={e => handleRegion(e.target.value)} />
                  <datalist id="rl">{Object.keys(REGIONS).map(r => <option key={r} value={r} />)}</datalist>
                </label>
                <label className="flabel"><span>Subregion / Appellation</span><input className="inp" value={form.subregion} placeholder="Margaux…" onChange={e => set('subregion', e.target.value)} /></label>
                {form.lat && <div className="coords-note fw">📌 Coordinates set: {(+form.lat).toFixed(2)}, {(+form.lng).toFixed(2)}</div>}
              </div>
            </div>

            {/* Cellar Details — Rating removed per v4.1: ratings are captured only when a bottle is consumed */}
            <div className="fsec">
              <div className="fsec-title">📦 Cellar Details</div>
              <div className="fgrid">
                <label className="flabel"><span>Quantity</span><input className="inp" type="number" min="0" value={form.qty} onChange={e => set('qty', e.target.value)} /></label>
                <label className="flabel"><span>Price per Bottle ($)</span><input className="inp" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} /></label>
                <label className="flabel fw"><span>Storage Location</span>
                  <select className="inp" value={form.storageLocationId} onChange={e => handleLocation(e.target.value)}>
                    <option value="">— Not assigned —</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* Drink Window */}
            <div className="fsec">
              <div className="fsec-title">⏳ Drink Window</div>
              <div className="fgrid">
                <label className="flabel"><span>Drink From</span>
                  <select className="inp" value={form.drinkStart} onChange={e => set('drinkStart', +e.target.value)}>
                    {Array.from({ length: 30 }, (_, i) => CY + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
                <label className="flabel"><span>Drink By</span>
                  <select className="inp" value={form.drinkEnd} onChange={e => set('drinkEnd', +e.target.value)}>
                    {Array.from({ length: 50 }, (_, i) => CY + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
              </div>
              <div className="wp-trk" style={{ marginTop: 12 }}>
                <div className="wp-win" style={{ left: `${winPct(+form.drinkStart)}%`, width: `${Math.min(100, winPct(+form.drinkEnd) - winPct(+form.drinkStart))}%` }} />
                <div className="wp-now-l" />
              </div>
              <div className="wp-lbls"><span>Now</span><span>{CY + 20}</span><span>{CY + 40}</span></div>
            </div>

            {/* WSET Tasting Profile — replaces the old 0-100 sliders */}
            <div className="fsec">
              <div className="fsec-title">🧬 Tasting Profile <span className="muted" style={{ fontWeight: 400, fontSize: '.78rem' }}>(WSET Level 3 scale)</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {WSET_FIELDS.map(({ k, l, scale }) => (
                  <div key={k} className="wset-row">
                    <span className="wset-lbl">{l}</span>
                    <div className="wset-opts">
                      {scale.map(opt => (
                        <button key={opt} type="button" className={`wset-opt${form[k] === opt ? ' active' : ''}`} onClick={() => set(k, opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="fsec">
              <div className="fsec-title">📝 Notes</div>
              <div className="fgrid">
                <label className="flabel fw"><span>Tasting Notes</span><textarea className="inp" rows={3} value={form.notes} placeholder="Aromas, palate, finish…" onChange={e => set('notes', e.target.value)} /></label>
                <label className="flabel fw"><span>Food Pairing</span><input className="inp" value={form.food} placeholder="Steak, lamb, mushroom risotto" onChange={e => set('food', e.target.value)} /></label>
                <label className="flabel fw"><span>Producer Notes</span><textarea className="inp" rows={2} value={form.teamBio} placeholder="About the winery…" onChange={e => set('teamBio', e.target.value)} /></label>
              </div>
            </div>
          </div>

          {error && <div className="ferr" style={{ marginTop: 12 }}>{error}</div>}
          <div className="frow">
            <button className="btn btn-s" onClick={() => nav('inventory')}>Cancel</button>
            <button className="btn btn-p" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to Cellar'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
