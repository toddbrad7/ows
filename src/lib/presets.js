export const CY = new Date().getFullYear()

export const REGIONS = {
  'Bordeaux, France':          { lat: 44.84, lng:  -0.58 },
  'Burgundy, France':          { lat: 47.05, lng:   4.85 },
  'Champagne, France':         { lat: 49.05, lng:   4.03 },
  'Alsace, France':            { lat: 48.32, lng:   7.44 },
  'Rhône Valley, France':      { lat: 44.93, lng:   4.82 },
  'Provence, France':          { lat: 43.53, lng:   5.44 },
  'Loire Valley, France':      { lat: 47.39, lng:   0.69 },
  'Languedoc, France':         { lat: 43.61, lng:   3.88 },
  'Beaujolais, France':        { lat: 46.14, lng:   4.68 },
  'Jura, France':              { lat: 46.68, lng:   5.65 },
  'Napa Valley, USA':          { lat: 38.29, lng: -122.29 },
  'Sonoma, USA':               { lat: 38.51, lng: -122.73 },
  'Willamette Valley, USA':    { lat: 45.29, lng: -123.05 },
  'Finger Lakes, USA':         { lat: 42.60, lng:  -76.90 },
  'Columbia Valley, USA':      { lat: 46.30, lng: -119.60 },
  'Texas Hill Country, USA':   { lat: 30.30, lng:  -98.90 },
  'Piedmont, Italy':           { lat: 44.70, lng:   8.04 },
  'Tuscany, Italy':            { lat: 43.77, lng:  11.25 },
  'Sicily, Italy':             { lat: 37.60, lng:  14.01 },
  'Veneto, Italy':             { lat: 45.44, lng:  11.87 },
  'Etna, Italy':               { lat: 37.75, lng:  15.00 },
  'Rioja, Spain':              { lat: 42.47, lng:  -2.45 },
  'Priorat, Spain':            { lat: 41.19, lng:   0.76 },
  'Jerez, Spain':              { lat: 36.68, lng:  -6.14 },
  'Ribera del Duero, Spain':   { lat: 41.68, lng:  -3.69 },
  'Douro, Portugal':           { lat: 41.16, lng:  -7.79 },
  'Vinho Verde, Portugal':     { lat: 41.55, lng:  -8.42 },
  'Setúbal, Portugal':         { lat: 38.52, lng:  -8.89 },
  'Mosel, Germany':            { lat: 49.97, lng:   6.95 },
  'Rheingau, Germany':         { lat: 50.03, lng:   7.95 },
  'Pfalz, Germany':            { lat: 49.33, lng:   8.11 },
  'Wachau, Austria':           { lat: 48.37, lng:  15.50 },
  'Tokaj, Hungary':            { lat: 48.12, lng:  21.42 },
  'Santorini, Greece':         { lat: 36.39, lng:  25.46 },
  'Mendoza, Argentina':        { lat: -32.89, lng: -68.84 },
  'Uco Valley, Argentina':     { lat: -33.65, lng: -69.20 },
  'Casablanca Valley, Chile':  { lat: -33.32, lng: -71.42 },
  'Colchagua Valley, Chile':   { lat: -34.64, lng: -71.30 },
  'Barossa Valley, Australia': { lat: -34.54, lng: 138.96 },
  'Margaret River, Australia': { lat: -33.95, lng: 115.07 },
  'Yarra Valley, Australia':   { lat: -37.65, lng: 145.45 },
  'Marlborough, New Zealand':  { lat: -41.51, lng: 173.96 },
  'Central Otago, New Zealand':{ lat: -45.03, lng: 169.15 },
  "Hawke's Bay, New Zealand":  { lat: -39.49, lng: 176.85 },
  'Swartland, South Africa':   { lat: -33.38, lng:  18.88 },
  'Stellenbosch, South Africa':{ lat: -33.93, lng:  18.86 },
  'Walker Bay, South Africa':  { lat: -34.42, lng:  19.30 },
  'Okanagan Valley, Canada':   { lat: 49.35, lng: -119.60 },
}

export const PRESETS = [
  { id: 'bold-red',    label: 'Bold Red',        emoji: '🍷', color: 'Red',      desc: 'Cabernet, Shiraz — powerful, tannic',      defaults: { sweetnessWset: 'Dry',      intensityWset: 'High',    bodyWset: 'Full',    acidWset: 'Medium',   tanninWset: 'High'    } },
  { id: 'eleg-red',   label: 'Elegant Red',      emoji: '🌹', color: 'Red',      desc: 'Pinot Noir, Nebbiolo — silky, aromatic',   defaults: { sweetnessWset: 'Dry',      intensityWset: 'Medium',  bodyWset: 'Medium',  acidWset: 'Medium+',  tanninWset: 'Medium'  } },
  { id: 'str-red',    label: 'Structured Red',   emoji: '🏛️', color: 'Red',      desc: 'Barolo, Brunello — firm, cellar-worthy',   defaults: { sweetnessWset: 'Dry',      intensityWset: 'High',    bodyWset: 'Medium+', acidWset: 'High',     tanninWset: 'High'    } },
  { id: 'min-white',  label: 'Mineral White',    emoji: '🪨', color: 'White',    desc: 'Chablis, Grüner — dry, crisp, saline',     defaults: { sweetnessWset: 'Dry',      intensityWset: 'Medium-', bodyWset: 'Light',   acidWset: 'High',     tanninWset: 'Low'     } },
  { id: 'rich-white', label: 'Rich White',       emoji: '🧈', color: 'White',    desc: 'Oaked Chardonnay — full, toasty',          defaults: { sweetnessWset: 'Off Dry',  intensityWset: 'Medium+', bodyWset: 'Full',    acidWset: 'Medium',   tanninWset: 'Low'     } },
  { id: 'arom-white', label: 'Aromatic White',   emoji: '🌸', color: 'White',    desc: 'Riesling, Gewurz — floral, off-dry',       defaults: { sweetnessWset: 'Medium Dry',intensityWset: 'Medium', bodyWset: 'Medium-', acidWset: 'High',     tanninWset: 'Low'     } },
  { id: 'sparkling',  label: 'Sparkling',        emoji: '🥂', color: 'Sparkling',desc: 'Champagne, Cava — bubbly, fresh',          defaults: { sweetnessWset: 'Off Dry',  intensityWset: 'Medium',  bodyWset: 'Medium-', acidWset: 'High',     tanninWset: 'Low'     } },
  { id: 'rose',       label: 'Rosé',             emoji: '🌅', color: 'Rosé',     desc: 'Provence — dry, delicate',                 defaults: { sweetnessWset: 'Dry',      intensityWset: 'Medium-', bodyWset: 'Light',   acidWset: 'Medium+',  tanninWset: 'Low'     } },
  { id: 'dessert',    label: 'Dessert / Sweet',  emoji: '🍯', color: 'White',    desc: 'Sauternes, Port — luscious, sweet',        defaults: { sweetnessWset: 'Luscious', intensityWset: 'High',    bodyWset: 'Full',    acidWset: 'Medium+',  tanninWset: 'Low'     } },
  { id: 'orange',     label: 'Orange Wine',      emoji: '🟠', color: 'Orange',   desc: 'Skin-contact — textured, tannic, funky',   defaults: { sweetnessWset: 'Dry',      intensityWset: 'Medium+', bodyWset: 'Medium+', acidWset: 'Medium+',  tanninWset: 'Medium-' } },
  { id: 'aged-brown', label: 'Aged / Fortified', emoji: '🥃', color: 'Brown',    desc: 'Sherry, Tawny Port, Madeira — oxidative',  defaults: { sweetnessWset: 'Sweet',    intensityWset: 'High',    bodyWset: 'Full',    acidWset: 'Medium',   tanninWset: 'Low'     } },
]

export const WINE_COLORS = ['Red', 'White', 'Rosé', 'Orange', 'Sparkling', 'Brown']

export const COLOR_HEX = {
  Red: '#7b1e22', White: '#c4922a', Sparkling: '#2d6e4e', Rosé: '#c46070', Orange: '#c47830', Brown: '#5c4326',
}

// ── WSET Level 3 scales ────────────────────────────────────────────────────────
export const WSET_5 = ['Low', 'Medium-', 'Medium', 'Medium+', 'High']
export const WSET_BODY = ['Light', 'Medium-', 'Medium', 'Medium+', 'Full']
export const WSET_SWEETNESS = ['Dry', 'Off Dry', 'Medium Dry', 'Medium Sweet', 'Sweet', 'Luscious']

export const WSET_FIELDS = [
  { k: 'sweetnessWset', l: 'Sweetness', scale: WSET_SWEETNESS },
  { k: 'intensityWset', l: 'Intensity',  scale: WSET_5 },
  { k: 'bodyWset',      l: 'Body',       scale: WSET_BODY },
  { k: 'acidWset',      l: 'Acidity',    scale: WSET_5 },
  { k: 'tanninWset',    l: 'Tannin',     scale: WSET_5 },
]

// Numeric position (0-based index) used for radar chart math / "distance" comparisons
export const wsetIndex = (scale, val) => Math.max(0, scale.indexOf(val))
export const wsetPct   = (scale, val) => (wsetIndex(scale, val) / (scale.length - 1)) * 100

// Only tastings you actually enjoyed (3★ or higher) count toward your palate profile.
// A wine you rated 1-2★ tells us what you DON'T like — including it would drag
// recommendations toward things you've already told us to avoid.
export const LIKED_RATING_THRESHOLD = 3

export function likedEvents(events) {
  return events.filter(e => (e.rating || 0) >= LIKED_RATING_THRESHOLD)
}

// Canonical taste profile — same math used by the Tasting History radar chart
// AND by the AI Sommelier/Recommendations system prompt, so what you see and what
// Claude reasons over are always identical.
export function computeTasteProfile(events) {
  const liked = likedEvents(events)
  if (!liked.length) return null
  const avg = (scale, key) => {
    const vals = liked.map(e => e[key]).filter(Boolean).map(v => wsetPct(scale, v))
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 50
  }
  return {
    sampleSize: liked.length,
    Sweetness: avg(WSET_SWEETNESS, 'sweetnessWset'),
    Intensity: avg(WSET_5, 'intensityWset'),
    Body:      avg(WSET_BODY, 'bodyWset'),
    Acidity:   avg(WSET_5, 'acidWset'),
    Tannin:    avg(WSET_5, 'tanninWset'),
  }
}

// Dominant WSET label per axis (for text prompts to Claude) — same 3★+ filter.
export function dominantWsetProfile(events) {
  const liked = likedEvents(events)
  const mode = key => {
    const counts = {}
    liked.forEach(e => { if (e[key]) counts[e[key]] = (counts[e[key]] || 0) + 1 })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries[0]?.[0] || null
  }
  return {
    sampleSize:    liked.length,
    sweetnessWset: mode('sweetnessWset'),
    intensityWset: mode('intensityWset'),
    bodyWset:      mode('bodyWset'),
    acidWset:      mode('acidWset'),
    tanninWset:    mode('tanninWset'),
  }
}

export const OCCASIONS = [
  'Dinner at home', 'Restaurant', 'Wine tasting',
  'Special occasion', 'Casual', 'Gift / shared',
]

export const LOC_TYPES = [
  { v: 'cellar',  i: '🏠', l: 'Home Cellar'    },
  { v: 'fridge',  i: '❄️', l: 'Wine Fridge'    },
  { v: 'offsite', i: '🏢', l: 'Offsite / Locker' },
  { v: 'shelf',   i: '📚', l: 'Shelf / Rack'   },
  { v: 'other',   i: '📦', l: 'Other'           },
]

export const REC_TYPES = [
  { id: 'similar',   icon: '🎯', label: 'Match My Taste',       desc: 'Wines matching your style, region and intensity.' },
  { id: 'outside',   icon: '🧭', label: 'Comfort Zone Stretch', desc: 'High-quality wines outside your usual profile.'   },
  { id: 'drink_now', icon: '⏰', label: 'Open Tonight',         desc: 'Which of YOUR bottles to drink right now.'        },
  { id: 'varietal',  icon: '🌱', label: 'New Varietals',        desc: '"If you like X, try Y" — grapes to explore.'     },
]

export const NAV_ITEMS = [
  { id: 'dashboard', i: '🏠', l: 'Dashboard'        },
  { id: 'inventory', i: '🍾', l: 'My Wines'          },
  { id: 'add',       i: '➕', l: 'Add Bottle'        },
  { id: 'recs',      i: '🎯', l: 'Recommendations'  },
  { id: 'sommelier', i: '💬', l: 'Ask Sommelier'     },
  { id: 'history',   i: '📖', l: 'Tasting History'   },
  { id: 'storage',   i: '📍', l: 'Storage Locations' },
  { id: 'import',    i: '📥', l: 'Import / Export'   },
]

export const CHAT_STARTERS = [
  'What should I open tonight?',
  'Which bottles are past their peak?',
  'Explain Burgundy vs Bordeaux.',
  'Best food pairing for my Barbaresco?',
  'How should I store red wines?',
]

// ── Utility helpers ───────────────────────────────────────────────────────────
export const money    = n  => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(+n || 0)
export const totBtl   = ws => ws.reduce((s, w) => s + (+w.qty  || 0), 0)
export const totVal   = ws => ws.reduce((s, w) => s + (+w.price || 0) * (+w.qty || 0), 0)
export const topByQty = (ws, k, n = 4) => {
  const m = {}
  ws.forEach(w => { const k2 = (w[k] || '?').split(',')[0].trim(); m[k2] = (m[k2] || 0) + (+w.qty || 1) })
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n)
}

export const dStatus = w => (w.drinkEnd || 9999) < CY ? 'past' : (w.drinkStart || 0) <= CY ? 'now' : 'hold'
export const dLabel  = w => ({ past: 'Past Peak', now: 'Drink Now', hold: 'Hold' })[dStatus(w)]

export const colorClass = c => {
  if (!c) return 'red'
  const l = c.toLowerCase()
  return l.includes('ros') ? 'ros' : l.split(' ')[0]
}

export const resolveCoords = w => {
  if (w.lat && w.lng) return { lat: +w.lat, lng: +w.lng }
  const key = Object.keys(REGIONS).find(k => w.region?.toLowerCase().includes(k.split(',')[0].toLowerCase()))
  return key ? REGIONS[key] : null
}

export const normaliseImport = raw => {
  const w = { ...raw }
  if (raw.year   && !raw.vintage) w.vintage    = raw.year
  if (raw.type   && !raw.color)   w.color      = raw.type
  if (raw.value  && !raw.price)   w.price      = raw.value
  if (!w.drinkStart) w.drinkStart = CY + 2
  if (!w.drinkEnd)   w.drinkEnd   = CY + 8
  if (!w.drinkPeak)  w.drinkPeak  = Math.round((+w.drinkStart + +w.drinkEnd) / 2)
  const c = resolveCoords(w)
  if (c && !w.lat) { w.lat = c.lat; w.lng = c.lng }
  const isR = (w.color || '').toLowerCase().includes('red')
  if (!w.intensity) w.intensity = isR ? 72 : 50
  if (!w.acid)      w.acid      = isR ? 62 : 74
  if (!w.tannin)    w.tannin    = isR ? 68 : 10
  if (!w.body)      w.body      = isR ? 68 : 48
  if (!w.sweetness) w.sweetness = 5
  return w
}
