import { useState, useMemo } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { money, totBtl, totVal, dStatus, dLabel, colorClass } from '../lib/presets.js'
import WineDetail from '../components/WineDetail.jsx'
import ConsumeModal from '../components/ConsumeModal.jsx'

export default function Inventory({ nav }) {
  const { wines, deleteWine, loading } = useCellar()
  const [q,       setQ]       = useState('')
  const [color,   setColor]   = useState('')
  const [status,  setStatus]  = useState('')
  const [loc,     setLoc]     = useState('')
  const [sort,    setSort]    = useState('name')
  const [detail,  setDetail]  = useState(null)
  const [consume, setConsume] = useState(null)

  const locs = [...new Set(wines.map(w => w.storageLocation).filter(Boolean))]

  const filtered = useMemo(() => wines
    .filter(w => {
      const ql = q.toLowerCase()
      return (!q || JSON.stringify(w).toLowerCase().includes(ql))
        && (!color  || w.color === color)
        && (!status || dStatus(w) === status)
        && (!loc    || w.storageLocation === loc)
    })
    .sort((a, b) => {
      if (sort === 'name')   return (a.name || '').localeCompare(b.name || '')
      if (sort === 'year')   return (b.vintage || 0) - (a.vintage || 0)
      if (sort === 'price')  return (b.price || 0) - (a.price || 0)
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sort === 'drink')  return (a.drinkStart || 0) - (b.drinkStart || 0)
      return 0
    }), [wines, q, color, status, loc, sort])

  if (loading) return <div className="loading"><div className="spin" /><span>Loading…</span></div>

  return (
    <div>
      <div className="hero">
        <div>
          <div className="eyebrow">Inventory</div>
          <h1 className="pg-title">My Wines</h1>
          <p className="pg-sub">{wines.length} wines · {totBtl(wines)} bottles · {money(totVal(wines))}</p>
        </div>
        <button className="btn btn-p" onClick={() => nav('add')}>+ Add Bottle</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <input className="inp" style={{ maxWidth: 260 }} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        <select className="inp" style={{ width: 'auto' }} value={color} onChange={e => setColor(e.target.value)}>
          <option value="">Any Color</option>
          {['Red', 'White', 'Rosé', 'Orange', 'Sparkling'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="inp" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Windows</option>
          <option value="now">Drink Now</option>
          <option value="hold">Hold</option>
          <option value="past">Past Peak</option>
        </select>
        {locs.length > 0 && (
          <select className="inp" style={{ width: 'auto' }} value={loc} onChange={e => setLoc(e.target.value)}>
            <option value="">All Locations</option>
            {locs.map(l => <option key={l}>{l}</option>)}
          </select>
        )}
        <select className="inp" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Name</option>
          <option value="year">Vintage</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="drink">Drink Window</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">{wines.length === 0 ? '🍾' : '🔍'}</div>
          <p>{wines.length === 0 ? 'Add your first wine!' : 'No wines match your filters.'}</p>
        </div>
      ) : (
        <div className="inv-list">
          {filtered.map(w => {
            const ds = dStatus(w)
            return (
              <div key={w.id} className="inv-row">
                <div className={`btl ${colorClass(w.color)}`} />
                <button className="inv-main" onClick={() => setDetail(w)}>
                  <div className="inv-nm">
                    <strong>{w.name}</strong>
                    {w.vintage && <span className="vtag">{w.vintage}</span>}
                  </div>
                  <div className="inv-meta">
                    {w.region}
                    {w.varietal && <><span>·</span>{w.varietal}</>}
                    {w.storageLocation && <><span>·</span>📍{w.storageLocation}</>}
                  </div>
                  <div className="inv-tags">
                    <span className={`badge b-${ds}`}>{dLabel(w)}</span>
                    {w.style && <span className="badge b-sty">{w.style}</span>}
                  </div>
                </button>
                <div className="inv-r">
                  <div className="stars">{'★'.repeat(Math.floor(w.rating || 0))}</div>
                  <div className="inv-price">{money(w.price)}</div>
                  <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>{w.qty}btl</div>
                </div>
                <div className="inv-acts">
                  <button className="btn-g" onClick={() => setDetail(w)}>Details</button>
                  <button className="btn-g" onClick={() => setConsume(w)} disabled={!w.qty} title="Open a bottle">🍷</button>
                  <button className="btn-g" onClick={() => nav('edit', w)}>Edit</button>
                  <button className="btn-d" onClick={async () => { if (!confirm(`Remove ${w.name}?`)) return; await deleteWine(w.id) }}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail  && <WineDetail wine={wines.find(w => w.id === detail.id) || detail} onClose={() => setDetail(null)} onEdit={w => { nav('edit', w); setDetail(null) }} />}
      {consume && <ConsumeModal wine={consume} onClose={() => setConsume(null)} />}
    </div>
  )
}
