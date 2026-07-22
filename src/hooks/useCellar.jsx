import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getWines, addWine, updateWine, deleteWine, consumeWine, importWines, exportCellar,
  getTastingEvents, getStorageLocations, addStorageLocation, deleteStorageLocation,
} from '../lib/db.js'

const Ctx = createContext(null)

export function CellarProvider({ children }) {
  const [wines,     setWines]     = useState([])
  const [events,    setEvents]    = useState([])
  const [locations, setLocations] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [w, e, l] = await Promise.all([getWines(), getTastingEvents(), getStorageLocations()])
      setWines(w)
      setEvents(e)
      setLocations(l)
    } catch (err) {
      console.error('Failed to load cellar data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Wine operations ───────────────────────────────────────────────────────
  const handleAddWine = async wine => {
    const added = await addWine(wine)
    setWines(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)))
    return added
  }

  const handleUpdateWine = async (id, updates) => {
    const updated = await updateWine(id, updates)
    setWines(prev => prev.map(w => w.id === id ? updated : w))
    return updated
  }

  const handleDeleteWine = async id => {
    await deleteWine(id)
    setWines(prev => prev.filter(w => w.id !== id))
  }

  const handleConsume = async (wine, eventData) => {
    const newQty = Math.max(0, (wine.qty || 1) - 1)
    const updated = await updateWine(wine.id, { qty: newQty, ...(newQty === 0 ? { status: 'consumed' } : {}) })
    setWines(prev => prev.map(w => w.id === wine.id ? updated : w))
    // Add tasting event via DB then reload events
    await consumeWine(wine, eventData)
    const refreshed = await getTastingEvents()
    setEvents(refreshed)
  }

  const handleImport = async wines => {
    const added = await importWines(wines)
    setWines(prev => [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name)))
    return added.length
  }

  const handleExport = () => exportCellar()

  // ── Location operations ───────────────────────────────────────────────────
  const handleAddLocation = async loc => {
    const added = await addStorageLocation(loc)
    setLocations(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)))
    return added
  }

  const handleDeleteLocation = async id => {
    await deleteStorageLocation(id)
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  return (
    <Ctx.Provider value={{
      wines, events, locations, loading, error,
      reload:         load,
      addWine:        handleAddWine,
      updateWine:     handleUpdateWine,
      deleteWine:     handleDeleteWine,
      consume:        handleConsume,
      importWines:    handleImport,
      exportCellar:   handleExport,
      addLocation:    handleAddLocation,
      deleteLocation: handleDeleteLocation,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCellar = () => useContext(Ctx)
