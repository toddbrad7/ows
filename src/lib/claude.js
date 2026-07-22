// All calls go through /api/claude — a Vercel serverless function.
// No API key is ever present in this file or in the browser bundle.

async function callClaude(system, user, maxTokens = 900) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages: [{ role: 'user', content: user }], max_tokens: maxTokens }),
  })
  const d = await res.json()
  if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`)
  return d.content.map(b => b.text || '').join('')
}

export function tasteProfile(wines, events, profile) {
  if (!wines.length) return 'No wines in cellar yet.'
  const bC = {}, bV = {}, bR = {}
  wines.forEach(w => {
    bC[w.color] = (bC[w.color] || 0) + (+w.qty || 1)
    const v = (w.varietal || '').split(',')[0].trim(); if (v) bV[v] = (bV[v] || 0) + (+w.qty || 1)
    const r = (w.region   || '').split(',')[0].trim(); if (r) bR[r] = (bR[r] || 0) + (+w.qty || 1)
  })
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]).join(', ')

  // WSET-scale averages from actual tasting history (the "mathematical taste profile")
  const wsetMode = key => {
    const counts = {}
    events.forEach(e => { if (e[key]) counts[e[key]] = (counts[e[key]] || 0) + 1 })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries[0]?.[0] || 'unknown'
  }
  const tr = events.filter(e => e.rating).reduce((s, e) => s + e.rating, 0)
  const tc = events.filter(e => e.rating).length

  const budgetLine = profile?.budgetPerBottle ? ` Typical budget: $${profile.budgetPerBottle}/bottle — respect this when suggesting price ranges.` : ''

  return `${wines.length} wines, ${wines.reduce((s, w) => s + (+w.qty || 0), 0)} bottles. Colors: ${top(bC, 2)}. Varietals: ${top(bV, 3)}. Regions: ${top(bR, 3)}. Avg rating from tasting history: ${tc ? (tr / tc).toFixed(1) : 'N/A'}/5. Taste profile from consumption (WSET scale) — Sweetness:${wsetMode('sweetnessWset')}, Intensity:${wsetMode('intensityWset')}, Body:${wsetMode('bodyWset')}, Acidity:${wsetMode('acidWset')}, Tannin:${wsetMode('tanninWset')}.${budgetLine} Recent tastings: ${events.slice(0, 4).map(e => `${e.wineName} ${e.wineVintage || ''}`).join(', ') || 'none'}.`
}

export async function getRecommendations(wines, events, type, profile) {
  const inst = {
    similar:    'Recommend 5 wines closely matching this taste profile, respecting the stated budget.',
    outside:    'Recommend 5 high-quality wines intentionally outside this profile to stretch the palate, respecting the stated budget.',
    drink_now:  'From the cellar list, identify the 5 most urgent to drink now (past/near peak first).',
    varietal:   'Suggest 5 grape varieties NOT in this cellar using "if you like X try Y" logic, respecting the stated budget.',
  }
  const cl = type === 'drink_now' ? wines.map(w => `- ${w.name} ${w.vintage || ''}, drink ${w.drinkStart || '?'}-${w.drinkEnd || '?'}, qty:${w.qty}`).join('\n') : ''
  const raw = await callClaude(
    'You are Open Wine Society\'s AI sommelier. Respond ONLY with a valid JSON array, no markdown.',
    `Profile: ${tasteProfile(wines, events, profile)}\n${cl ? `Cellar:\n${cl}\n` : ''}\nTask: ${inst[type] || inst.similar}\n\nReturn JSON array of exactly 5: [{name,vintage,region,varietal,color,priceRange,matchScore,adventureScore,withinProfile,reason,drinkWindow,style}]\nwithinProfile must be true if the wine matches the user's dominant WSET taste profile, false if it's a deliberate stretch.`,
    1100
  )
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function getAgingAnalysis(wine) {
  const raw = await callClaude(
    'You are a master sommelier aging expert. Respond ONLY with a valid JSON object, no markdown.',
    `Analyse: ${wine.name} ${wine.vintage || ''}, ${wine.region}, ${wine.varietal}, ${wine.color}, ABV ${wine.abv || '?'}%. WSET profile — Sweetness:${wine.sweetnessWset}, Intensity:${wine.intensityWset}, Tannin:${wine.tanninWset}, Acidity:${wine.acidWset}, Body:${wine.bodyWset}. User window: ${wine.drinkStart}-${wine.drinkEnd}. Year: ${new Date().getFullYear()}.\nReturn JSON: {drinkStart,peakYear,drinkEnd,maturityState,confidenceScore,agingRationale,tertiaryNotes:{plus3,plus5,plus10},storageNote}`,
    700
  )
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function sommelierChat(messages, wines, events, profile) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: `You are Open Wine Society's personal AI sommelier — warm, expert, practical. Cellar: ${tasteProfile(wines, events, profile)}. Wines: ${wines.map(w => `${w.name} ${w.vintage || ''}(${w.qty || 0}btl)`).join(', ') || 'none'}. Be concise (2-3 paragraphs).`,
      messages,
      max_tokens: 500,
    }),
  })
  const d = await res.json()
  if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`)
  return d.content.map(b => b.text || '').join('')
}
