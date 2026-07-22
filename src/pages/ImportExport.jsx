import { useState } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { normaliseImport } from '../lib/presets.js'

const IMP_COLORS = { Red: '#7b1e22', White: '#c4922a', Sparkling: '#2d6e4e', Rosé: '#c46070', Orange: '#c47830' }

export default function ImportExport({ nav }) {
  const { importWines, exportCellar } = useCellar()
  const [step,  setStep]  = useState(1)
  const [ws,    setWs]    = useState([])
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)
  const [count, setCount] = useState(0)

  const handleFile = async f => {
    if (!f || !f.name.endsWith('.json')) { setError('Please upload a .json file.'); return }
    setError('')
    try {
      const raw = JSON.parse(await f.text())
      if (!Array.isArray(raw)) throw new Error('Expected a JSON array.')
      if (!raw.length) throw new Error('File is empty.')
      setWs(raw.map(normaliseImport)); setStep(2)
    } catch (e) { setError('Could not read: ' + e.message) }
  }

  const doImport = async () => {
    setBusy(true); setError('')
    try { const n = await importWines(ws); setCount(n); setStep(3) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  const doExport = async () => {
    const d = await exportCellar()
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b)
    a.download = `open-wine-society-${new Date().toISOString().split('T')[0]}.json`; a.click()
  }

  return (
    <div style={{ maxWidth: 740 }}>
      <div className="hero">
        <div><div className="eyebrow">Data</div><h1 className="pg-title">Import / Export</h1></div>
        <button className="btn btn-s" onClick={doExport}>↓ Export My Cellar</button>
      </div>
      <div className="imp-steps">{['Upload', 'Preview', 'Done'].map((l, i) => <div key={l} className={`imp-step${step > i + 1 ? ' done' : step === i + 1 ? ' act' : ''}`}><div className="step-dot">{step > i + 1 ? '✓' : i + 1}</div><span>{l}</span></div>)}</div>
      {step === 1 && <>
        <label className="dropzone" onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }} onDragOver={e => e.preventDefault()}>
          <div className="dz-ico">📂</div><div className="dz-tit">Drop your JSON file here</div><div className="dz-sub">or click to browse · Compatible with previous exports</div>
          <input type="file" accept=".json" hidden onChange={e => handleFile(e.target.files[0])} />
        </label>
        {error && <div className="ferr">{error}</div>}
        <div className="fmt-hint"><h3>Expected format</h3><pre className="fmt-pre">{'[{"name":"Chateau Margaux","year":2015,"type":"Red",\n "region":"Bordeaux, France","price":150,"qty":3}]'}</pre><p style={{ fontSize: '.79rem', color: 'var(--ink2)' }}>✅ Supports: name, year/vintage, type/color, region, price/value, qty, drinkStart, drinkEnd, notes, varietal, producer</p></div>
      </>}
      {step === 2 && <>
        <div className="prev-sum">{[{ v: ws.length, l: 'Wines' }, { v: ws.reduce((s, w) => s + (+w.qty || 0), 0), l: 'Bottles' }, { v: [...new Set(ws.map(w => w.region))].length, l: 'Regions' }, { v: '$' + ws.reduce((s, w) => s + (+w.price || 0) * (+w.qty || 0), 0).toLocaleString(), l: 'Est. Value' }].map(({ v, l }) => <div key={l} className="ps-st"><strong>{v}</strong><span>{l}</span></div>)}</div>
        {ws.some(w => !w.lat) && <div className="imp-warn">⚠️ {ws.filter(w => !w.lat).length} wines couldn't be matched to map coordinates — they'll still import correctly.</div>}
        <div className="prev-tbl-wrap"><table className="prev-tbl"><thead><tr><th /><th>Wine</th><th>Vintage</th><th>Region</th><th>Qty</th><th>Price</th><th>Drink</th></tr></thead><tbody>{ws.map((w, i) => <tr key={i}><td><span className="pdot" style={{ background: IMP_COLORS[w.color] || '#7b1e22' }} /></td><td><strong>{w.name}</strong></td><td>{w.vintage || '—'}</td><td style={{ maxWidth: 120, fontSize: '.78rem' }}>{w.region || '—'}</td><td>{w.qty ?? '—'}</td><td>${w.price ?? '—'}</td><td>{w.drinkStart}–{w.drinkEnd}</td></tr>)}</tbody></table></div>
        {error && <div className="ferr">{error}</div>}
        <div className="frow"><button className="btn btn-s" onClick={() => { setStep(1); setWs([]) }}>Back</button><button className="btn btn-p" onClick={doImport} disabled={busy}>{busy ? 'Importing…' : `Import ${ws.length} Wines`}</button></div>
      </>}
      {step === 3 && <div className="imp-done"><div className="di">🍾</div><h2>Import Complete</h2><p>{count} wines added to your cellar.</p><div className="frow" style={{ justifyContent: 'center', marginTop: 22 }}><button className="btn btn-p" onClick={() => { setStep(1); setWs([]); setCount(0); nav('inventory') }}>Go to My Wines</button></div></div>}
    </div>
  )
}
