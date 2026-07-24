import { supabase } from './supabase.js'

async function currentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  return user.id
}

// ── Wines ─────────────────────────────────────────────────────────────────────
// Active inventory only — consumed wines (qty=0, status='consumed') are excluded
// and live on in tasting_events per the v4.1 consumption behavior spec.
export async function getWines() {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .neq('status', 'consumed')
    .order('name')
  if (error) throw error
  return data.map(fromRow)
}

export async function addWine(wine) {
  const uid = await currentUserId()
  const { data, error } = await supabase
    .from('wines')
    .insert([{ ...toRow(wine), user_id: uid }])
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function updateWine(id, updates) {
  const { data, error } = await supabase
    .from('wines')
    .update(toRow(updates))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function deleteWine(id) {
  const { error } = await supabase.from('wines').delete().eq('id', id)
  if (error) throw error
}

// Consuming a bottle: decrement qty. If it hits 0, flip status to 'consumed' so it
// drops out of active Inventory (getWines filters it) but the row + its history persist.
export async function consumeWine(wine, eventData) {
  const newQty = Math.max(0, (wine.qty || 1) - 1)
  await updateWine(wine.id, { qty: newQty, ...(newQty === 0 ? { status: 'consumed' } : {}) })
  return addTastingEvent({
    wineId:      wine.id,
    wineName:    wine.name,
    wineVintage: wine.vintage,
    wineRegion:  wine.region,
    wineColor:   wine.color,
    ...eventData,
  })
}

export async function importWines(wines) {
  const uid = await currentUserId()
  const rows = wines.map(w => ({ ...toRow({ ...w, id: undefined }), user_id: uid }))
  const { data, error } = await supabase.from('wines').insert(rows).select()
  if (error) throw error
  return data.map(fromRow)
}

export async function exportCellar() {
  const [{ data: wines }, { data: events }] = await Promise.all([
    supabase.from('wines').select('*'),
    supabase.from('tasting_events').select('*').order('tasted_at', { ascending: false }),
  ])
  return {
    exportedAt: new Date().toISOString(),
    wines:         (wines  || []).map(fromRow),
    tastingEvents: (events || []).map(fromEventRow),
  }
}

// ── Tasting Events ────────────────────────────────────────────────────────────
// This is the ONLY place ratings are recorded (per v4.1 — rating removed from Add Wine).
export async function getTastingEvents() {
  const { data, error } = await supabase
    .from('tasting_events')
    .select('*')
    .order('tasted_at', { ascending: false })
  if (error) throw error
  return data.map(fromEventRow)
}

export async function addTastingEvent(ev) {
  const uid = await currentUserId()
  const { data, error } = await supabase
    .from('tasting_events')
    .insert([{
      user_id:              uid,
      wine_id:              ev.wineId,
      wine_name:            ev.wineName,
      wine_vintage:         ev.wineVintage,
      wine_region:          ev.wineRegion,
      wine_color:           ev.wineColor,
      tasted_at:            ev.tastedAt || new Date().toISOString().split('T')[0],
      rating:               ev.rating,
      sweetness_perceived:  ev.sweetnessPerceived,
      intensity_perceived:  ev.intensityPerceived,
      notes:                ev.notes,
      food_pairing:         ev.foodPairing,
      occasion:             ev.occasion,
      intensity_wset:       ev.intensityWset,
      tannin_wset:          ev.tanninWset,
      acid_wset:            ev.acidWset,
      body_wset:            ev.bodyWset,
      sweetness_wset:       ev.sweetnessWset,
    }])
    .select()
    .single()
  if (error) throw error
  return fromEventRow(data)
}

// Edit an existing tasting record — corrects the experiential facts (date, rating,
// WSET perceptions, notes, pairing, occasion) WITHOUT touching wine inventory,
// since consumption already happened; this only fixes how it was recorded.
export async function updateTastingEvent(id, ev) {
  const row = {}
  if (ev.tastedAt            !== undefined) row.tasted_at           = ev.tastedAt
  if (ev.rating              !== undefined) row.rating              = ev.rating
  if (ev.occasion            !== undefined) row.occasion            = ev.occasion
  if (ev.notes               !== undefined) row.notes               = ev.notes
  if (ev.foodPairing         !== undefined) row.food_pairing        = ev.foodPairing
  if (ev.sweetnessPerceived  !== undefined) row.sweetness_perceived = ev.sweetnessPerceived
  if (ev.intensityPerceived  !== undefined) row.intensity_perceived = ev.intensityPerceived
  if (ev.sweetnessWset       !== undefined) row.sweetness_wset      = ev.sweetnessWset
  if (ev.intensityWset       !== undefined) row.intensity_wset      = ev.intensityWset
  if (ev.bodyWset            !== undefined) row.body_wset           = ev.bodyWset
  if (ev.acidWset            !== undefined) row.acid_wset           = ev.acidWset
  if (ev.tanninWset          !== undefined) row.tannin_wset         = ev.tanninWset
  const { data, error } = await supabase
    .from('tasting_events')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromEventRow(data)
}

export async function deleteTastingEvent(id) {
  const { error } = await supabase.from('tasting_events').delete().eq('id', id)
  if (error) throw error
}
export async function getStorageLocations() {
  const { data, error } = await supabase
    .from('storage_locations')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function addStorageLocation(loc) {
  const uid = await currentUserId()
  const { data, error } = await supabase
    .from('storage_locations')
    .insert([{ ...loc, user_id: uid }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStorageLocation(id) {
  const { error } = await supabase.from('storage_locations').delete().eq('id', id)
  if (error) throw error
}

// ── Profile (budget, admin flag, display name) ───────────────────────────────
export async function getProfile() {
  const uid = await currentUserId()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single()
  if (error) throw error
  return {
    id: data.id, email: data.email, displayName: data.display_name,
    isAdmin: data.is_admin, budgetPerBottle: data.budget_per_bottle,
  }
}

export async function updateProfile(updates) {
  const uid = await currentUserId()
  const row = {}
  if (updates.displayName !== undefined)     row.display_name = updates.displayName
  if (updates.budgetPerBottle !== undefined) row.budget_per_bottle = updates.budgetPerBottle
  const { error } = await supabase.from('profiles').update(row).eq('id', uid)
  if (error) throw error
}

// ── Site settings (public read, admin write — homepage hero) ────────────────
export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*')
  if (error) throw error
  return Object.fromEntries(data.map(r => [r.key, r.value]))
}

export async function updateSiteSetting(key, value) {
  const { error } = await supabase.from('site_settings').upsert({ key, value })
  if (error) throw error
}

export async function uploadHeroImage(file) {
  const uid = await currentUserId()
  const ext = file.name.split('.').pop()
  const path = `hero-${uid}-${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
  await updateSiteSetting('hero_image_url', data.publicUrl)
  return data.publicUrl
}

// ── Row mappers (snake_case DB ↔ camelCase app) ───────────────────────────────
function toRow(w) {
  const r = {}
  if (w.name       !== undefined) r.name        = w.name
  if (w.producer   !== undefined) r.producer     = w.producer
  if (w.winemaker  !== undefined) r.winemaker    = w.winemaker
  if (w.vintage    !== undefined) r.vintage      = w.vintage
  if (w.region     !== undefined) r.region       = w.region
  if (w.subregion  !== undefined) r.subregion    = w.subregion
  if (w.varietal   !== undefined) r.varietal     = w.varietal
  if (w.color      !== undefined) r.color        = w.color
  if (w.style      !== undefined) r.style        = w.style
  if (w.grapes     !== undefined) r.grapes       = w.grapes
  if (w.qty        !== undefined) r.qty          = w.qty
  if (w.price      !== undefined) r.price        = w.price
  if (w.abv        !== undefined) r.abv          = w.abv
  // WSET scale fields (text) replace the old 0-100 numeric sliders
  if (w.sweetnessWset !== undefined) r.sweetness_wset = w.sweetnessWset
  if (w.intensityWset !== undefined) r.intensity_wset = w.intensityWset
  if (w.bodyWset      !== undefined) r.body_wset      = w.bodyWset
  if (w.acidWset      !== undefined) r.acid_wset      = w.acidWset
  if (w.tanninWset    !== undefined) r.tannin_wset    = w.tanninWset
  if (w.drinkStart !== undefined) r.drink_start  = w.drinkStart
  if (w.drinkEnd   !== undefined) r.drink_end    = w.drinkEnd
  if (w.drinkPeak  !== undefined) r.drink_peak   = w.drinkPeak
  if (w.notes      !== undefined) r.notes        = w.notes
  if (w.food       !== undefined) r.food         = w.food
  if (w.teamBio    !== undefined) r.team_bio     = w.teamBio
  if (w.storageLocationId !== undefined) r.storage_location_id = w.storageLocationId
  if (w.storageLocation   !== undefined) r.storage_location    = w.storageLocation
  if (w.lat        !== undefined) r.lat          = w.lat
  if (w.lng        !== undefined) r.lng          = w.lng
  if (w.status     !== undefined) r.status       = w.status
  return r
}

function fromRow(r) {
  return {
    id:                 r.id,
    name:               r.name,
    producer:           r.producer,
    winemaker:          r.winemaker,
    vintage:            r.vintage,
    region:             r.region,
    subregion:          r.subregion,
    varietal:           r.varietal,
    color:              r.color,
    style:              r.style,
    grapes:             r.grapes,
    qty:                r.qty,
    price:              r.price,
    abv:                r.abv,
    rating:             r.rating, // legacy display only; new ratings live on tasting_events
    sweetnessWset:      r.sweetness_wset,
    intensityWset:      r.intensity_wset,
    bodyWset:           r.body_wset,
    acidWset:           r.acid_wset,
    tanninWset:         r.tannin_wset,
    drinkStart:         r.drink_start,
    drinkEnd:           r.drink_end,
    drinkPeak:          r.drink_peak,
    notes:              r.notes,
    food:               r.food,
    teamBio:            r.team_bio,
    storageLocationId:  r.storage_location_id,
    storageLocation:    r.storage_location,
    lat:                r.lat,
    lng:                r.lng,
    status:             r.status,
    createdAt:          r.created_at,
  }
}

function fromEventRow(r) {
  return {
    id:                  r.id,
    wineId:              r.wine_id,
    wineName:            r.wine_name,
    wineVintage:         r.wine_vintage,
    wineRegion:          r.wine_region,
    wineColor:           r.wine_color,
    tastedAt:            r.tasted_at,
    rating:              r.rating,
    sweetnessPerceived:  r.sweetness_perceived,
    intensityPerceived:  r.intensity_perceived,
    notes:               r.notes,
    foodPairing:         r.food_pairing,
    occasion:            r.occasion,
    intensityWset:       r.intensity_wset,
    tanninWset:          r.tannin_wset,
    acidWset:            r.acid_wset,
    bodyWset:            r.body_wset,
    sweetnessWset:       r.sweetness_wset,
    createdAt:           r.created_at,
  }
}
