import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { LOC_TYPES, colorClass } from '../lib/presets.js'

export default function StorageLocations() {
  const { wines, locations, addLocation, deleteLocation } = useCellar()
  const [adding,   setAdding]   = useState(false)
  const [form,     setForm]     = useState({ name: '', type: 'cellar', notes: '' })
  const [saving,   setSaving]   = useState(false)
  const [expanded, setExpanded] = useState(null)

  const byLoc = {}
  wines.forEach(w => { const k = w.storageLocationId || '__none'; (byLoc[k] = byLoc[k] || []).push(w) })
  const unassigned = byLoc['__none'] || []

  const handleAdd = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await addLocation({ name: form.name.trim(), icon: LOC_TYPES.find(t => t.v === form.type)?.i || '📦', type: form.type, notes: form.notes })
      setForm({ name: '', type: 'cellar', notes: '' }); setAdding(false)
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="hero">
        <div><div className="eyebrow">Cellar Management</div><h1 className="pg-title">Storage Locations</h1><p className="pg-sub">Track where every bottle lives.</p></div>
        <button className="btn btn-p" onClick={() => setAdding(true)}>+ Add Location</button>
      </div>
      {adding && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 13, fontFamily: 'Playfair Display,serif' }}>New Location</h3>
          <div className="fgrid">
            <label className="flabel"><span>Name</span><input className="inp" placeholder="e.g. Basement Cellar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
            <label className="flabel"><span>Type</span>
              <select className="inp" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {LOC_TYPES.map(t => <option key={t.v} value={t.v}>{t.i} {t.l}</option>)}
              </select>
            </label>
            <label className="flabel fw"><span>Notes</span><input className="inp" placeholder="Capacity, temperature…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></label>
          </div>
          <div className="frow">
            <button className="btn btn-s" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleAdd} disabled={saving || !form.name.trim()}>{saving ? 'Saving…' : 'Add'}</button>
          </div>
        </div>
      )}
      <div className="loc-grid">
        {locations.map(loc => {
          const btls = byLoc[loc.id] || [], tot = btls.reduce((s, w) => s + (+w.qty || 0), 0), isExp = expanded === loc.id
          return (
            <div key={loc.id} className="loc-card">
              <div className="loc-hdr">
                <span className="loc-ico">{loc.icon}</span>
                <div className="loc-inf"><strong>{loc.name}</strong><span className="muted">{LOC_TYPES.find(t => t.v === loc.type)?.l || loc.type}</span></div>
                <div className="loc-sts"><span>{btls.length} wines</span><span>{tot} btl</span></div>
                <div className="loc-acts">
                  <button className="btn-g" onClick={() => setExpanded(isExp ? null : loc.id)}>{isExp ? 'Hide' : 'View'}</button>
                  <button className="btn-d" onClick={async () => { if (!confirm(`Delete "${loc.name}"?`)) return; await deleteLocation(loc.id) }}>×</button>
                </div>
              </div>
              {loc.notes && <p className="muted" style={{ fontSize: '.79rem', marginTop: 7, paddingTop: 7, borderTop: '1px solid var(--line2)' }}>{loc.notes}</p>}
              {isExp && <div className="loc-btls">{btls.length === 0 ? <p className="muted">No bottles assigned.</p> : btls.map(w => <div key={w.id} className="loc-wr"><div className={`btl ${colorClass(w.color)}`} /><div><strong>{w.name} {w.vintage || ''}</strong><span className="muted"> · {w.qty}btl</span></div></div>)}</div>}
            </div>
          )
        })}
        {unassigned.length > 0 && (
          <div className="loc-card" style={{ borderStyle: 'dashed', opacity: .8 }}>
            <div className="loc-hdr"><span className="loc-ico">❓</span><div className="loc-inf"><strong>Unassigned</strong><span className="muted">No location set</span></div><div className="loc-sts"><span>{unassigned.length} wines</span></div><button className="btn-g" onClick={() => setExpanded(expanded === '__none' ? null : '__none')}>{expanded === '__none' ? 'Hide' : 'View'}</button></div>
            {expanded === '__none' && <div className="loc-btls">{unassigned.map(w => <div key={w.id} className="loc-wr"><div className={`btl ${colorClass(w.color)}`} /><div><strong>{w.name} {w.vintage || ''}</strong><span className="muted"> · Edit wine to assign</span></div></div>)}</div>}
          </div>
        )}
        {locations.length === 0 && !adding && <div className="empty"><div className="empty-ico">🏠</div><h2>No locations yet</h2><p>Add your home cellar, wine fridge or offsite storage.</p><button className="btn btn-p" style={{ marginTop: 14 }} onClick={() => setAdding(true)}>Add First Location</button></div>}
      </div>
    </div>
  )
}
