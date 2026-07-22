import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSetting, uploadHeroImage } from '../lib/db.js'

export default function AdminConsole() {
  const [settings, setSettings] = useState(null)
  const [headline, setHeadline] = useState('')
  const [body,     setBody]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => {
    getSiteSettings().then(s => {
      setSettings(s)
      setHeadline(s.hero_headline || '')
      setBody(s.hero_body || '')
    })
  }, [])

  const saveCopy = async () => {
    setSaving(true); setMsg('')
    try {
      await updateSiteSetting('hero_headline', headline)
      await updateSiteSetting('hero_body', body)
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
    <div style={{ maxWidth: 720 }}>
      <div className="hero"><div><div className="eyebrow">Admin</div><h1 className="pg-title">Administration Console</h1><p className="pg-sub">Manage the public homepage.</p></div></div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-hdr"><h2>Hero Image</h2></div>
        {settings.hero_image_url && (
          <img src={settings.hero_image_url} alt="Current hero" style={{ width: '100%', borderRadius: 12, marginBottom: 12, maxHeight: 240, objectFit: 'cover' }} />
        )}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        {uploading && <p className="muted" style={{ marginTop: 8 }}>Uploading…</p>}
      </div>

      <div className="card">
        <div className="card-hdr"><h2>Homepage Copy</h2></div>
        <label className="flabel" style={{ marginBottom: 12 }}>
          <span>Headline</span>
          <input className="inp" value={headline} onChange={e => setHeadline(e.target.value)} />
        </label>
        <label className="flabel">
          <span>Body</span>
          <textarea className="inp" rows={4} value={body} onChange={e => setBody(e.target.value)} />
        </label>
        {msg && <p className="muted" style={{ marginTop: 10 }}>{msg}</p>}
        <div className="frow"><button className="btn btn-p" onClick={saveCopy} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></div>
      </div>
    </div>
  )
}
