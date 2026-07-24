import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { OCCASIONS, WSET_FIELDS } from '../lib/presets.js'

export default function EditTastingModal({ event, onClose }) {
  const { updateEvent, deleteEvent } = useCellar()
  const [form, setForm] = useState({
    tastedAt:      event.tastedAt || new Date().toISOString().split('T')[0],
    rating:        event.rating || 4,
    notes:         event.notes || '',
    foodPairing:   event.foodPairing || '',
    occasion:      event.occasion || 'Dinner at home',
    sweetnessWset: event.sweetnessWset || 'Dry',
    intensityWset: event.intensityWset || 'Medium',
    bodyWset:      event.bodyWset      || 'Medium',
    acidWset:      event.acidWset      || 'Medium',
    tanninWset:    event.tanninWset    || 'Medium',
  })
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(false)
  const [error,   setError]   = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError('')
    try { await updateEvent(event.id, form); onClose() }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete this tasting record for ${event.wineName}? This can't be undone.`)) return
    setDeleting(true); setError('')
    try { await deleteEvent(event.id); onClose() }
    catch (e) { setError(e.message); setDeleting(false) }
  }

  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="m-hdr">
          <div>
            <div className="eyebrow">Edit tasting record</div>
            <div className="m-title">{event.wineName} {event.wineVintage || ''}</div>
            <div className="muted">{event.wineRegion}</div>
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

          <div className="sec-label" style={{ marginTop: 4 }}>How did it actually taste? <span className="muted" style={{ fontWeight: 400, textTransform: 'none' }}>(WSET scale)</span></div>
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

          <label className="flabel"><span>Tasting Notes</span><textarea className="inp" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
          <label className="flabel"><span>Food Pairing</span><input className="inp" value={form.foodPairing} onChange={e => set('foodPairing', e.target.value)} /></label>

          {error && <div className="ferr">{error}</div>}
        </div>
        <div className="m-foot" style={{ justifyContent: 'space-between' }}>
          <button className="btn-d" onClick={handleDelete} disabled={deleting || saving}>{deleting ? 'Deleting…' : 'Delete Record'}</button>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-s" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={handleSave} disabled={saving || deleting}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
