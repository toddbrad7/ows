import { useState, useRef, useEffect } from 'react'
import { useCellar } from '../hooks/useCellar.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { sommelierChat } from '../lib/claude.js'

const STARTERS = [
  'What should I open tonight?', 'Which bottles are past their peak?',
  'Explain Burgundy vs Bordeaux.', 'Best food pairing for my Barbaresco?', 'How should I store red wines?',
]

export default function Sommelier() {
  const { wines, events } = useCellar()
  const { profile } = useAuth()
  const [msgs,    setMsgs]    = useState([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async text => {
    const t = (text || input).trim(); if (!t) return
    setInput('')
    const nm = [...msgs, { role: 'user', content: t }]
    setMsgs(nm); setLoading(true)
    try {
      const r = await sommelierChat(nm, wines, events, profile)
      setMsgs(m => [...m, { role: 'assistant', content: r }])
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', content: `⚠️ ${e.message}` }])
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="hero"><div><div className="eyebrow">AI Sommelier</div><h1 className="pg-title">Ask Your Sommelier</h1><p className="pg-sub">Knows your cellar, your profile, and a great deal about wine.</p></div></div>
      <div className="chat-wrap">
        <div className="chat-win">
          {msgs.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-av">🍷</div>
              <h3>Good evening.</h3>
              <p>Ask me about your cellar, what to open, pairings, regions or wine education.</p>
              <div className="starters">{STARTERS.map(s => <button key={s} className="starter" onClick={() => send(s)}>{s}</button>)}</div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.role === 'assistant' && <div className="bav">🍷</div>}
              <div className="btxt">{m.content.split('\n').map((l, j) => <p key={j} style={{ margin: j > 0 ? '7px 0 0' : 0 }}>{l}</p>)}</div>
            </div>
          ))}
          {loading && <div className="bubble assistant"><div className="bav">🍷</div><div className="btxt typing"><span /><span /><span /></div></div>}
          <div ref={bottomRef} />
        </div>
        <div className="chat-inp-bar">
          <textarea className="chat-inp" placeholder="Ask about your cellar, pairings, regions…" value={input} rows={2} disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
          <button className="btn btn-p" style={{ alignSelf: 'flex-end' }} onClick={() => send()} disabled={loading || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  )
}
