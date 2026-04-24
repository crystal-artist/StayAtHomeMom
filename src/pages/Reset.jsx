import { useMemo } from 'react'
import { useTodos } from '../hooks/useTodos'
import { useFlowEntries } from '../hooks/useFlowEntries'
import { extractSkills } from '../utils/skillMapper'

const fmt = (d) => d.toISOString().split('T')[0]
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekBounds() {
  const now = new Date()
  const dow = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { monday: mon, sunday: sun }
}

// ─── Weekly bar chart ──────────────────────────────────────────────────────────
function WeeklyBars({ todos }) {
  const { monday } = getWeekBounds()
  const todayStr = fmt(new Date())

  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr  = fmt(d)
    const dayTodos = todos.filter(t => t.date === dateStr)
    const done     = dayTodos.filter(t => t.done).length
    const total    = dayTodos.length
    return { label: DAYS_SHORT[i], pct: total ? Math.round((done / total) * 100) : 0, done, total, isToday: dateStr === todayStr }
  })

  return (
    <div className="bg-white rounded-2xl px-5 pt-5 pb-4 mb-4 fade-slide-up" style={{ animationDelay: '80ms' }}>
      <p className="text-[10px] tracking-widest text-stone-400 font-medium mb-4">WEEKLY COMPLETION</p>
      <div className="flex items-end gap-1.5 h-20">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-stone-400 h-3">{bar.total > 0 ? `${bar.pct}%` : ''}</span>
            <div
              className="w-full rounded-t-md transition-all duration-700"
              style={{
                height: `${Math.max(bar.total > 0 ? Math.max(bar.pct, 8) : 4, 4)}%`,
                backgroundColor: bar.isToday ? 'var(--accent)' : 'var(--card-bg)',
                transitionDelay: `${i * 80}ms`,
              }}
            />
            <span className={`text-[9px] ${bar.isToday ? 'font-bold text-stone-600' : 'text-stone-400'}`}>{bar.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100">
        <span className="flex items-center gap-1 text-[10px] text-stone-400">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--accent)' }} /> Today
        </span>
        <span className="text-[10px] text-stone-400">
          {todos.filter(t => t.done).length} / {todos.length} tasks done this week
        </span>
      </div>
    </div>
  )
}

// ─── Skill bars ────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  'Emotional Management':    '#d4a0a0',
  'Health & Medical':        '#a0bfd4',
  'Education & Development': '#a8d4a0',
  'Home Operations':         '#d4c9a0',
  'Project Coordination':    '#b0a0d4',
  'Administrative':          '#d4b8a0',
  'Planning & Scheduling':   '#a0d4c8',
  'Child Development':       '#d4a8c0',
}

function SkillBars({ categories }) {
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1])
  if (!entries.length) return null
  const max = entries[0][1]

  return (
    <div className="bg-white rounded-2xl px-5 py-5 mb-4 fade-slide-up" style={{ animationDelay: '160ms' }}>
      <p className="text-[10px] tracking-widest text-stone-400 font-medium mb-4">SKILL DISTRIBUTION</p>
      <div className="flex flex-col gap-3">
        {entries.map(([cat, val], i) => (
          <div key={cat} className="fade-slide-up" style={{ animationDelay: `${160 + i * 50}ms` }}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-stone-600">{cat}</span>
              <span className="text-[10px] text-stone-400">{val} signal{val > 1 ? 's' : ''}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(val / max) * 100}%`,
                  backgroundColor: CAT_COLORS[cat] || 'var(--accent)',
                  transition: `width 0.8s ease ${i * 80}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Resume card ───────────────────────────────────────────────────────────────
function ResumeCard({ tip, index }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 mb-3 fade-slide-up" style={{ animationDelay: `${320 + index * 80}ms` }}>
      <div className="flex gap-3">
        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: 'var(--card-bg)' }}>
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Reset() {
  const { todos }      = useTodos()
  const { entries }    = useFlowEntries()
  const { monday, sunday } = getWeekBounds()

  const weekTodos = useMemo(() =>
    todos.filter(t => { const d = new Date(t.date); return d >= monday && d <= sunday }),
    [todos]
  )

  const weekFlowTexts = useMemo(() => {
    const start = fmt(monday)
    const end   = fmt(sunday)
    return entries.filter(e => e.date && e.date >= start && e.date <= end).map(e => e.text)
  }, [entries])

  const allTexts = [...weekTodos.map(t => t.title), ...weekFlowTexts]
  const { matched, categories } = useMemo(() => extractSkills(allTexts), [allTexts.join()])

  const done     = weekTodos.filter(t => t.done).length
  const total    = weekTodos.length
  const pct      = total ? Math.round((done / total) * 100) : 0
  const allSkills = [...new Set(matched.flatMap(m => m.skills))].slice(0, 10)
  const resumeTips = matched.map(m => m.resumeTip).slice(0, 3)

  const weekLabel = (() => {
    const o = { month: 'short', day: 'numeric' }
    return `${monday.toLocaleDateString('en-US', o)} – ${sunday.toLocaleDateString('en-US', o)}`
  })()

  return (
    <div className="px-6 pt-6 pb-32">
      {/* Header */}
      <p className="text-[11px] tracking-[0.2em] text-stone-400 font-medium mb-2 fade-slide-up" style={{ animationDelay: '0ms' }}>WEEKLY RESET</p>
      <h1
        className="text-3xl font-bold text-stone-800 leading-snug mb-1 fade-slide-up"
        style={{ animationDelay: '50ms', fontFamily: "'Playfair Display', serif" }}
      >
        You showed up.
      </h1>
      <p className="text-sm text-stone-400 mb-6 fade-slide-up" style={{ animationDelay: '90ms' }}>{weekLabel}</p>

      {/* Completion ring */}
      <div className="rounded-2xl px-5 py-4 mb-4 flex items-center gap-5 fade-slide-up" style={{ animationDelay: '120ms', backgroundColor: 'var(--card-bg)' }}>
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#e8e4df" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="22" fill="none"
              stroke="var(--accent)" strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-700">{pct}%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-700">{done} of {total} tasks completed</p>
          <p className="text-xs text-stone-400 mt-0.5">{weekFlowTexts.length} moments recorded this week</p>
          {pct === 100 && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>Perfect week. 🎉</p>}
        </div>
      </div>

      {/* Weekly bars */}
      <WeeklyBars todos={weekTodos} />

      {/* Skill tags */}
      {allSkills.length > 0 && (
        <div className="mb-5 fade-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium mb-3">WHAT YOU PRACTICED</p>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill, i) => (
              <span
                key={skill}
                className="text-xs px-3 py-1.5 rounded-full font-medium fade-in"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--accent)', animationDelay: `${220 + i * 35}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill distribution */}
      <SkillBars categories={categories} />

      {/* Resume insights */}
      {resumeTips.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium mb-3 fade-slide-up" style={{ animationDelay: '300ms' }}>RESUME INSIGHTS</p>
          {resumeTips.map((tip, i) => <ResumeCard key={i} tip={tip} index={i} />)}
        </div>
      )}

      {/* Empty state */}
      {allTexts.length === 0 && (
        <div className="text-center py-10 fade-in">
          <p className="text-stone-400 text-sm">Start logging moments in Flow and completing tasks in Plan — your weekly summary will appear here.</p>
        </div>
      )}

      {/* Closing note */}
      <div className="rounded-2xl px-5 py-5 mt-6 fade-slide-up" style={{ animationDelay: '500ms', backgroundColor: 'var(--card-bg)' }}>
        <p className="text-sm text-stone-500 italic leading-relaxed">
          "Every task you managed this week is a skill. Every moment of patience is a competency. The work of care is real work — and it belongs on your story."
        </p>
      </div>
    </div>
  )
}
