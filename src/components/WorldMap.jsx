import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

// Free public topojson — no API key, no billing.
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function WorldMap({ wines }) {
  const [tip, setTip] = useState(null)
  const pinned = wines.filter(w => w.lat && w.lng)

  return (
    <div style={{ position: 'relative' }}>
      <ComposableMap projectionConfig={{ scale: 130 }} style={{ width: '100%', height: 'auto' }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) => geographies.map(geo => (
            <Geography key={geo.rsmKey} geography={geo} fill="#f2e9d6" stroke="#e0d3c0" strokeWidth={0.5} />
          ))}
        </Geographies>
        {pinned.map(w => (
          <Marker key={w.id} coordinates={[w.lng, w.lat]}
            onMouseEnter={() => setTip(w)} onMouseLeave={() => setTip(null)}>
            <circle r={4} fill="#6b1d1d" stroke="#fff" strokeWidth={1} />
          </Marker>
        ))}
      </ComposableMap>
      {tip && (
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--sh2)', fontSize: '.82rem', pointerEvents: 'none' }}>
          <strong>{tip.name}</strong> {tip.vintage || ''}<br />
          <span className="muted">{tip.region}</span>
        </div>
      )}
      {pinned.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>Add wines with a region to see them plotted here.</p>
      )}
    </div>
  )
}
