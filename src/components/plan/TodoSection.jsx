import { useState } from 'react'
import { POINTS } from '../../hooks/useTodos'

const PRIORITY = {
  small:  { label: 'Small',  color: 'bg-stone-100 text-stone-400' },
  medium: { label: 'Medium', color: 'bg-stone-100 text-stone-400' },
  large:  { label: 'Large',  color: 'bg-stone-100 text-stone-400' },
}

const fmt = (d) => d.toISOString().split('T')[0]

export default function TodoSection({ todos, history, selectedDate, onAdd, onToggle, onDelete }) {
  const [adding, setAdding]     = useState(false)
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [date, setDate]         = useState(fmt(new Date()))
  const [toast, setToast]       = useState(null)

  // Active todos for the view
  const filtered = selectedDate ? todos.filter(t => t.date === selectedDate) : todos
  const sorted   = [...filtered].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return ({ large: 0, medium: 1, small: 2 })[a.priority] - ({ large: 0, medium: 1, small: 2 })[b.priority]
  })

  // Completed history for the selected date (only shown when a date is picked)
  const dayHistory = selectedDate
    ? history
        .filter(e => e.date === selectedDate)
        .sort((a, b) => b.completedAt - a.completedAt)
    : []

  function handleToggle(todo) {
    if (!todo.done) {
      setToast(todo.id)
      setTimeout(() => setToast(null), 1800)
    }
    onToggle(todo.id)
  }

  function handleAdd() {
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, date })
    setTitle(''); setPriority('medium'); setDate(fmt(new Date())); setAdding(false)
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] tracking-[0.18em] text-stone-400 font-medium">
          {selectedDate ? `TASKS · ${selectedDate}` : 'ALL TASKS'}
          {selectedDate && (
            <span className="ml-1 opacity-60">
              ({filtered.filter(t => t.done).length}/{filtered.length} active)
            </span>
          )}
        </span>
        <button
          onClick={() => setAdding(a => !a)}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Add task
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl p-4 mb-3 fade-slide-up">
          <input
            autoFocus
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full text-sm text-stone-700 outline-none border-b border-stone-100 pb-2 mb-3 bg-transparent"
          />
          <div className="flex gap-2 mb-3 flex-wrap">
            {Object.entries(PRIORITY).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setPriority(key)}
                className={`text-xs px-3 py-1 rounded-full transition-all font-medium ${priority === key ? 'bg-stone-700 text-white' : cfg.color}`}
              >
                {cfg.label} +{POINTS[key]}pt
              </button>
            ))}
          </div>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-xs text-stone-400 bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 outline-none mb-3 block"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="text-xs px-4 py-1.5 bg-stone-700 text-white rounded-lg font-medium">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs px-4 py-1.5 bg-stone-100 text-stone-500 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Active todo list */}
      {sorted.length === 0 && dayHistory.length === 0 && (
        <p className="text-sm text-stone-400 text-center py-6">
          No tasks {selectedDate ? 'for this day' : 'yet'}.
        </p>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {sorted.map((todo, i) => {
            const cfg = PRIORITY[todo.priority]
            return (
              <div
                key={todo.id}
                className={`flex items-start gap-3 bg-white rounded-2xl px-4 py-3 transition-opacity fade-slide-up ${todo.done ? 'opacity-50' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={() => handleToggle(todo)}
                  className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${todo.done ? 'bg-stone-700 border-stone-700' : 'border-stone-300 hover:border-stone-500'}`}
                >
                  {todo.done && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${todo.done ? 'line-through text-stone-400' : 'text-stone-700'}`}>{todo.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label} · +{POINTS[todo.priority]}pt
                    </span>
                    <span className="text-[10px] text-stone-300">{todo.date}</span>
                  </div>
                </div>
                {toast === todo.id && (
                  <span className="text-xs font-bold text-amber-500 fade-in flex-shrink-0">+{POINTS[todo.priority]}pt ✓</span>
                )}
                <button
                  onClick={() => onDelete(todo.id)}
                  className="text-stone-200 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed history for selected date */}
      {dayHistory.length > 0 && (
        <div className="fade-in">
          <div className="flex items-center gap-2 mb-2 mt-1">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-[10px] tracking-widest text-stone-400 font-medium px-1">COMPLETED & ARCHIVED</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <div className="flex flex-col gap-2">
            {dayHistory.map((entry, i) => {
              const cfg = PRIORITY[entry.priority] || PRIORITY.small
              const time = new Date(entry.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-2xl px-4 py-3 fade-slide-up"
                  style={{ animationDelay: `${i * 50}ms`, backgroundColor: 'var(--card-bg)' }}
                >
                  {/* Filled checkmark — archived */}
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-stone-400 flex-shrink-0 flex items-center justify-center">
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-400 line-through leading-snug">{entry.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color} opacity-70`}>
                        {cfg.label} · +{entry.points}pt
                      </span>
                      <span className="text-[10px] text-stone-300">completed {time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
