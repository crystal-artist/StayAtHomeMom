import { useState } from 'react'
import { useTodos } from '../hooks/useTodos'
import { usePhotos } from '../hooks/usePhotos'
import { useTheme, THEMES } from '../context/ThemeContext'
import CalendarStrip from '../components/plan/CalendarStrip'
import TodoSection from '../components/plan/TodoSection'
import AIPlanner from '../components/plan/AIPlanner'
import PhotoDump from '../components/plan/PhotoDump'

// ─── Points + Theme Shop ──────────────────────────────────────────────────────
function PointsBar({ points }) {
  const { themeId, setThemeId } = useTheme()
  const [open, setOpen] = useState(false)

  const currentIdx = THEMES.findIndex(t => t.id === themeId)
  const nextTheme  = THEMES[currentIdx + 1]
  const prevReq    = THEMES[currentIdx]?.required || 0
  const progress   = nextTheme
    ? Math.min(100, ((points - prevReq) / (nextTheme.required - prevReq)) * 100)
    : 100

  return (
    <div className="rounded-2xl px-5 py-4 mb-5 fade-slide-up" style={{ backgroundColor: 'var(--card-bg)', animationDelay: '0ms' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{points}</span>
          <span className="text-xs text-stone-400">points earned</span>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="5" width="4.5" height="3.5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V4C5 3.17 5.67 2.5 6.5 2.5C7.33 2.5 8 3.17 8 4V5" stroke="currentColor" strokeWidth="1.2"/></svg>
          Themes
        </button>
      </div>

      {nextTheme ? (
        <>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }} />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{nextTheme.required - points} pts to unlock <b>{nextTheme.name}</b></p>
        </>
      ) : (
        <p className="text-[10px] text-stone-400">All themes unlocked 🎉</p>
      )}

      {open && (
        <div className="mt-4 pt-4 border-t border-stone-200 fade-in">
          <p className="text-[10px] tracking-widest text-stone-400 mb-3">CHOOSE THEME</p>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => {
              const unlocked = points >= t.required
              const active   = themeId === t.id
              return (
                <button
                  key={t.id}
                  disabled={!unlocked}
                  onClick={() => unlocked && setThemeId(t.id)}
                  className={`relative rounded-xl p-3 text-left transition-all ${active ? 'ring-2 ring-stone-600' : ''} ${unlocked ? 'hover:scale-[1.02]' : 'opacity-40 cursor-not-allowed'}`}
                  style={{ backgroundColor: t.bg }}
                >
                  <div className="flex gap-1 mb-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.card }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: t.text }}>{t.name}</p>
                  {!unlocked && <p className="text-[10px]" style={{ color: t.text, opacity: 0.5 }}>{t.required}pt to unlock</p>}
                  {active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-stone-700" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Plan() {
  const { todos, history, totalPoints, addTodo, toggleTodo, deleteTodo } = useTodos()
  const { getPhotos, addPhoto, deletePhoto } = usePhotos()
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(true)
  const activeDate = selectedDate || new Date().toISOString().split('T')[0]

  return (
    <div className="px-6 pt-6 pb-32">
      <PointsBar points={totalPoints} />

      {/* Calendar */}
      <div className="mb-4 fade-slide-up" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] tracking-[0.18em] text-stone-400 font-medium">CALENDAR</span>
          <button
            onClick={() => setCalendarOpen(o => !o)}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            {calendarOpen ? 'Hide' : 'Show'}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: calendarOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .3s' }}>
              <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="collapsible" style={{ maxHeight: calendarOpen ? '380px' : '0px', opacity: calendarOpen ? 1 : 0 }}>
          <CalendarStrip todos={todos} history={history} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
      </div>

      {/* Todos */}
      <TodoSection todos={todos} history={history} selectedDate={selectedDate} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} />

      <div className="w-full h-px bg-stone-200 my-8" />

      {/* AI Day Planner */}
      <AIPlanner />

      {/* Photo Dump */}
      <PhotoDump
        date={activeDate}
        photos={getPhotos(activeDate)}
        onAdd={addPhoto}
        onDelete={deletePhoto}
      />
    </div>
  )
}
