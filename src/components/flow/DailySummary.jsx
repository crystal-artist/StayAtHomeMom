import { useRef } from 'react'
import { CATEGORIES, formatMin } from './QuickLogSheet'

// ── Hex chart constants ────────────────────────────────────────────────────────
const HEX = [
  { id: 'parenting', label: 'Parenting', icon: '👶' },
  { id: 'home',      label: 'Home',      icon: '🏠' },
  { id: 'health',    label: 'Health',    icon: '💊' },
  { id: 'selfcare',  label: 'Self',      icon: '✨' },
  { id: 'exercise',  label: 'Exercise',  icon: '🏃' },
  { id: 'growth',    label: 'Growth',    icon: '📚' },
]

const CX = 130, CY = 138, R = 82, LABEL_R = R + 30

function hexPt(i, r) {
  const a = (i * 60 - 90) * Math.PI / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function tAnchor(i) {
  const x = hexPt(i, 1)[0]
  if (x < CX - 4) return 'end'
  if (x > CX + 4) return 'start'
  return 'middle'
}

function communityRank(totalMin) {
  if (totalMin >= 360) return { rank: 'Top 5%',  badge: '🏆', label: 'Super Mom' }
  if (totalMin >= 240) return { rank: 'Top 15%', badge: '⭐', label: 'Powerhouse' }
  if (totalMin >= 120) return { rank: 'Top 30%', badge: '✨', label: 'Steady & Strong' }
  if (totalMin >= 60)  return { rank: 'Top 50%', badge: '💪', label: 'Showing Up' }
  return                        { rank: 'Top 70%', badge: '🌱', label: 'Starting the Day' }
}

// ── Hex SVG ────────────────────────────────────────────────────────────────────
function HexChart({ values }) {
  const gridScales = [0.25, 0.5, 0.75, 1]

  function polyPath(r) {
    return HEX.map((_, i) => {
      const [x, y] = hexPt(i, r)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ') + 'Z'
  }

  const dataPath = HEX.map((h, i) => {
    const v = Math.max(0.06, values[h.id] || 0)
    const [x, y] = hexPt(i, R * v)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ') + 'Z'

  return (
    <svg viewBox="0 0 260 276" width="220" height="220">
      {/* Grid rings */}
      {gridScales.map(s => (
        <path key={s} d={polyPath(R * s)} fill="none" stroke="#e7e5e4" strokeWidth="1"/>
      ))}
      {/* Axis spokes */}
      {HEX.map((_, i) => {
        const [x, y] = hexPt(i, R)
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e7e5e4" strokeWidth="1"/>
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="1.8"/>
      {/* Data dots */}
      {HEX.map((h, i) => {
        const v = Math.max(0.06, values[h.id] || 0)
        const [x, y] = hexPt(i, R * v)
        return <circle key={i} cx={x} cy={y} r="4" fill="var(--accent)"/>
      })}
      {/* Labels */}
      {HEX.map((h, i) => {
        const [lx, ly] = hexPt(i, LABEL_R)
        const anchor = tAnchor(i)
        return (
          <g key={i}>
            <text x={lx} y={ly - 1} textAnchor={anchor} fontSize="14" fontFamily="sans-serif">{h.icon}</text>
            <text x={lx} y={ly + 13} textAnchor={anchor} fontSize="8.5" fill="#a8a29e" fontFamily="Inter, sans-serif">{h.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Canvas share card ──────────────────────────────────────────────────────────
function drawShareCard(canvas, values, totalMin, rank, dateStr) {
  const W = 1080, H = 1080
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#f0ede8'; ctx.fillRect(0, 0, W, H)

  // Top header
  ctx.fillStyle = '#292524'
  ctx.font = 'bold 64px Georgia, serif'
  ctx.fillText('Archive', 80, 110)

  ctx.fillStyle = '#a8a29e'
  ctx.font = '32px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(dateStr, W - 80, 110)
  ctx.textAlign = 'left'

  ctx.strokeStyle = '#e7e5e4'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(80, 135); ctx.lineTo(W - 80, 135); ctx.stroke()

  // Hexagon chart on canvas
  const cx = W / 2, cy = 530, rMax = 240

  function cHexPt(i, r) {
    const a = (i * 60 - 90) * Math.PI / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }

  // Grid
  [0.25, 0.5, 0.75, 1].forEach(s => {
    ctx.beginPath()
    HEX.forEach((_, i) => {
      const [x, y] = cHexPt(i, rMax * s)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.strokeStyle = '#e7e5e4'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  // Axes
  HEX.forEach((_, i) => {
    const [x, y] = cHexPt(i, rMax)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y)
    ctx.strokeStyle = '#e7e5e4'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  // Data polygon
  ctx.beginPath()
  HEX.forEach((h, i) => {
    const v = Math.max(0.06, values[h.id] || 0)
    const [x, y] = cHexPt(i, rMax * v)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.fillStyle = 'rgba(120,113,108,0.18)'; ctx.fill()
  ctx.strokeStyle = '#78716c'; ctx.lineWidth = 3; ctx.stroke()

  // Dots
  HEX.forEach((h, i) => {
    const v = Math.max(0.06, values[h.id] || 0)
    const [x, y] = cHexPt(i, rMax * v)
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#78716c'; ctx.fill()
  })

  // Labels (icon + label)
  HEX.forEach((h, i) => {
    const [lx, ly] = cHexPt(i, rMax + 70)
    ctx.textAlign = 'center'
    ctx.font = '36px sans-serif'; ctx.fillText(h.icon, lx, ly)
    ctx.font = '24px Inter, sans-serif'; ctx.fillStyle = '#a8a29e'
    ctx.fillText(h.label, lx, ly + 30)
    ctx.fillStyle = '#292524'
  })

  // Stats
  const statsY = 830
  ctx.textAlign = 'center'; ctx.fillStyle = '#292524'
  ctx.font = 'bold 52px Georgia, serif'
  ctx.fillText(formatMin(totalMin) + ' logged today', cx, statsY)

  ctx.font = '34px Inter, sans-serif'; ctx.fillStyle = '#a8a29e'
  ctx.fillText(`${rank.badge}  ${rank.label} · ${rank.rank} in community`, cx, statsY + 54)

  // Divider
  ctx.strokeStyle = '#e7e5e4'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(200, 920); ctx.lineTo(W - 200, 920); ctx.stroke()

  // Tagline
  ctx.font = 'italic 38px Georgia, serif'; ctx.fillStyle = '#78716c'
  ctx.fillText('"Today I showed up."', cx, 972)

  ctx.font = '26px Inter, sans-serif'; ctx.fillStyle = '#c5c0bb'
  ctx.fillText('archive app', cx, 1020)
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DailySummary({ entries }) {
  const canvasRef = useRef(null)

  // Compute minutes per category for today
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(e => e.date === today && e.categoryId)

  const minutesByCat = {}
  HEX.forEach(h => { minutesByCat[h.id] = 0 })
  todayEntries.forEach(e => {
    if (minutesByCat[e.categoryId] !== undefined)
      minutesByCat[e.categoryId] += e.minutes || 0
  })

  const totalMin = Object.values(minutesByCat).reduce((s, v) => s + v, 0)
  // Normalise: value = minutes / 240 (4h = full axis)
  const values = {}
  HEX.forEach(h => { values[h.id] = Math.min(1, minutesByCat[h.id] / 240) })

  const rank = communityRank(totalMin)

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  async function handleShare() {
    const canvas = canvasRef.current
    drawShareCard(canvas, values, totalMin, rank, dateStr)
    canvas.toBlob(async blob => {
      const file = new File([blob], 'archive-my-day.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ title: 'My Day — Archive', files: [file] }) }
        catch (e) { if (e.name !== 'AbortError') download(blob) }
      } else {
        download(blob)
      }
    })
  }

  function download(blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'archive-my-day.png'; a.click()
    URL.revokeObjectURL(url)
  }

  if (totalMin === 0) return null

  return (
    <div className="mt-10 fade-slide-up" style={{ animationDelay: '0ms' }}>
      <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium mb-5">DAILY SUMMARY</p>

      {/* Hex chart card */}
      <div className="bg-white rounded-2xl p-5 mb-3 flex flex-col items-center">
        <HexChart values={values} />

        {/* Total */}
        <div className="mt-3 text-center">
          <p className="text-xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            {formatMin(totalMin)} logged today
          </p>
          <p className="text-xs text-stone-400 mt-0.5">{rank.badge} {rank.label} · {rank.rank} in community</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl px-4 py-3 mb-3">
        {HEX.filter(h => minutesByCat[h.id] > 0).map(h => {
          const cat = CATEGORIES.find(c => c.id === h.id)
          return (
            <div key={h.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: cat?.bg || '#f5f5f4' }}
              >
                {h.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-medium text-stone-600">{h.label}</p>
                  <p className="text-xs text-stone-400">{formatMin(minutesByCat[h.id])}</p>
                </div>
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (minutesByCat[h.id] / Math.max(...Object.values(minutesByCat))) * 100)}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium text-white transition-opacity active:opacity-80"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11 2L14 5M14 5L11 8M14 5H6C4.3 5 3 6.3 3 8V14" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Share my day
      </button>

      {/* Hidden canvas for share image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
