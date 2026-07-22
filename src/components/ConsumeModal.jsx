import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { OCCASIONS, WSET_FIELDS } from '../lib/presets.js'

export default function ConsumeModal({ wine, onClose }) {
  const { consume } = useCellar()
  const [form, setForm] = useState({
    tastedAt:      new Date().toISOString().split('T')[0],
    rating:        4,
    notes:         '',
    foodPairing:   '',
    occasion:      'Dinner at home',
    // Pre-fill from the wine's own profile; editable since perception can differ from the label
    sweetnessWset: wine.sweetnessWset || 'Dry',
    intensityWset: wine.intensityWset || 'Medium',
    bodyWset:      wine.bodyWset      || 'Medium',
    acidWset:      wine.acidWset      || 'Medium',
    tanninWset:    wine.tanninWset    || 'Medium',
  })
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try { await consume(wine, form); setDone(true) }
    catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {done ? (
          <div className="m-done">
            <div className="di">🍷</div>
            <h2>Enjoyed!</h2>
            <p><strong>{wine.name}</strong> recorded in tasting history.</p>
            <p className="muted" style={{ marginTop: 5 }}>
              {wine.qty > 1 ? `${wine.qty - 1} bottle${wine.qty - 1 !== 1 ? 's' : ''} remaining.` : 'Last bottle consumed — moved to Tasting History.'}
            </p>
            <button className="btn btn-p" style={{ marginTop: 16 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="m-hdr">
              <div>
                <div className="eyebrow">Open a bottle</div>
                <div className="m-title">{wine.name} {wine.vintage || ''}</div>
                <div className="muted">{wine.region} · {wine.qty} btl remaining</div>
              </div>
              <button className="m-close" onClick={onClose}>✕</button>
            </div>
            <div className="m-body">
              <div className="frow2">
                <label className="flabel"><span>Date</span><input className="inp" type="date" value={form.tastedAt} onChange={e => set('tastedAt', e.target.value)} /></label>
                <label className="flabel"><span>Occasion</span>
                  <select className="inp" value={form.occasion} onChange={e => set('occasion', e.target.value)}>
                    {OCCASIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </label>
              </div>

              <div className="flabel">
                <span>Your Rating</span>
                <div className="star-pick lg">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" className={`sbtn${n <= form.rating ? ' on' : ''}`} onClick={() => set('rating', n)}>★</button>
                  ))}
                  <span className="star-lbl">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating] || ''}</span>
                </div>
              </div>

              <div className="sec-label" style={{ marginTop: 4 }}>How did it actually taste? <span className="muted" style={{ fontWeight: 400, textTransform: 'none' }}>(WSET scale — feeds your Taste Profile)</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {WSET_FIELDS.map(({ k, l, scale }) => (
                  <div key={k} className="wset-row">
                    <span className="wset-lbl">{l}</span>
                    <div className="wset-opts">
                      {scale.map(opt => (
                        <button key={opt} type="button" className={`wset-opt${form[k] === opt ? ' active' : ''}`} onClick={() => set(k, opt)}>{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <label className="flabel"><span>Tasting Notes</span><textarea className="inp" rows={3} placeholder="What did you taste?" value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
              <label className="flabel"><span>Food Pairing</span><input className="inp" placeholder="What did you eat with it?" value={form.foodPairing} onChange={e => set('foodPairing', e.target.value)} /></label>
            </div>
            <div className="m-foot">
              <button className="btn btn-s" onClick={onClose}>Cancel</button>
              <button className="btn btn-p" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : '🍷 Record Consumption'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
