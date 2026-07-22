// Pure SVG radar chart — no charting library dependency.
// axes: [{ label, pct (0-100) }] in clockwise order starting at top.
export default function RadarChart({ axes, size = 220, color = '#8e3a35' }) {
  const cx = size / 2, cy = size / 2
  const r  = size * 0.36
  const n  = axes.length
  const angleFor = i => (Math.PI * 2 * i) / n - Math.PI / 2

  const pointFor = (i, pct) => {
    const a = angleFor(i)
    const rr = r * (pct / 100)
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]
  }

  const ringLevels = [0.25, 0.5, 0.75, 1]
  const dataPoints = axes.map((ax, i) => pointFor(i, ax.pct))
  const dataPath = dataPoints.map(p => p.join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* Background rings */}
      {ringLevels.map(lv => {
        const pts = axes.map((_, i) => {
          const a = angleFor(i)
          return [cx + r * lv * Math.cos(a), cy + r * lv * Math.sin(a)].join(',')
        }).join(' ')
        return <polygon key={lv} points={pts} fill="none" stroke="#e0d3c0" strokeWidth="1" />
      })}
      {/* Spokes */}
      {axes.map((_, i) => {
        const a = angleFor(i)
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e0d3c0" strokeWidth="1" />
      })}
      {/* Data shape */}
      <polygon points={dataPath} fill={color} fillOpacity="0.28" stroke={color} strokeWidth="2" />
      {dataPoints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={color} />)}
      {/* Labels */}
      {axes.map((ax, i) => {
        const a = angleFor(i)
        const lx = cx + (r + 22) * Math.cos(a)
        const ly = cy + (r + 22) * Math.sin(a)
        return (
          <text key={ax.label} x={lx} y={ly} fontSize="11" fontWeight="600" fill="#4a3c34"
            textAnchor={Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle'}
            dominantBaseline={Math.sin(a) > 0.3 ? 'hanging' : Math.sin(a) < -0.3 ? 'auto' : 'middle'}>
            {ax.label}
          </text>
        )
      })}
    </svg>
  )
}
