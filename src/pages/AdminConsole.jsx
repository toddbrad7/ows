import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSetting, uploadHeroImage } from '../lib/db.js'

const CARD_KEYS = [1, 2, 3, 4]

export default function AdminConsole() {
  const [settings,  setSettings]  = useState(null)
  const [form,      setForm]      = useState({})
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg,       setMsg]       = useState('')

  useEffect(() => {
    getSiteSettings().then(s => {
      setSettings(s)
      setForm({
        hero_headline: s.hero_headline || '',
        hero_body:     s.hero_body || '',
        instagram_url: s.instagram_url || '',
        ...Object.fromEntries(CARD_KEYS.flatMap(n => [
          [`phil${n}_icon`,     s[`phil${n}_icon`] || ''],
          [`phil${n}_headline`, s[`phil${n}_headline`] || ''],
          [`phil${n}_body`,     s[`phil${n}_body`] || ''],
          [`phil${n}_link`,     s[`phil${n}_link`] || ''],
        ])),
      })
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const saveAll = async () => {
    setSaving(true); setMsg('')
    try {
      await Promise.all(Object.entries(form).map(([key, value]) => updateSiteSetting(key, value)))
      setMsg('Saved.')
    } catch (e) { setMsg('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleUpload = async e => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true); setMsg('')
    try {
      const url = await uploadHeroImage(file)
      setSettings(s => ({ ...s, hero_image_url: url }))
      setMsg('Hero image updated.')
    } catch (e) { setMsg('Error: ' + e.message) }
    finally { setUploading(false) }
  }

  if (!settings) return <div className="loading"><div className="spin" /><span>Loading…</span></div>

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="hero"><div><div className="eyebrow">Admin</div><h1 className="pg-title">Administration Console</h1><p className="pg-sub">Manage the public homepage.</p></div></div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-hdr"><h2>Hero Image</h2></div>
        {settings.hero_image_url && (
          <img src={settings.hero_image_url} alt="Current hero" style={{ width: '100%', borderRadius: 12, marginBottom: 12, maxHeight: 240, objectFit: 'cover' }} />
        )}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        {uploading && <p className="muted" style={{ marginTop: 8 }}>Uploading…</p>}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-hdr"><h2>Hero Text</h2></div>
        <label className="flabel" style={{ marginBottom: 12 }}>
          <span>Headline</span>
          <input className="inp" value={form.hero_headline || ''} onChange={e => set('hero_headline', e.target.value)} />
        </label>
        <label className="flabel">
          <span>Body</span>
          <textarea className="inp" rows={3} value={form.hero_body || ''} onChange={e => set('hero_body', e.target.value)} />
        </label>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-hdr"><h2>Social</h2></div>
        <label className="flabel">
          <span>Instagram URL</span>
          <input className="inp" placeholder="https://instagram.com/yourhandle" value={form.instagram_url || ''} onChange={e => set('instagram_url', e.target.value)} />
        </label>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-hdr"><h2>Homepage Info Cards</h2></div>
        <p className="muted" style={{ fontSize: '.82rem', marginBottom: 14 }}>Cards 1–3 appear as-is. Card 4 is your Wine Club box — add a link and it becomes clickable.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {CARD_KEYS.map(n => (
            <div key={n} style={{ borderTop: n > 1 ? '1px solid var(--line2)' : 'none', paddingTop: n > 1 ? 16 : 0 }}>
              <div className="sec-label">Card {n}</div>
              <div className="fgrid">
                <label className="flabel"><span>Icon (emoji)</span><input className="inp" value={form[`phil${n}_icon`] || ''} onChange={e => set(`phil${n}_icon`, e.target.value)} /></label>
                <label className="flabel"><span>Headline</span><input className="inp" value={form[`phil${n}_headline`] || ''} onChange={e => set(`phil${n}_headline`, e.target.value)} /></label>
                <label className="flabel fw"><span>Body</span><textarea className="inp" rows={2} value={form[`phil${n}_body`] || ''} onChange={e => set(`phil${n}_body`, e.target.value)} /></label>
                {n === 4 && (
                  <label className="flabel fw"><span>Link (Wine Club URL)</span><input className="inp" placeholder="https://…" value={form.phil4_link || ''} onChange={e => set('phil4_link', e.target.value)} /></label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="muted" style={{ marginBottom: 10 }}>{msg}</p>}
      <div className="frow"><button className="btn btn-p" onClick={saveAll} disabled={saving}>{saving ? 'Saving…' : 'Save All Changes'}</button></div>
    </div>
  )
}
