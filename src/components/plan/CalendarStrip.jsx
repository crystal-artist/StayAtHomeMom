import { useState } from 'react'

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const fmt = (d) => d.toISOString().split('T')[0]

export default function CalendarStrip({ todos, history = [], selectedDate, onSelectDate }) {
  const today = new Date()
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year  = view.getFullYear()
  const month = view.getMonth()

  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, current: false, date: fmt(new Date(year, month - 1, daysInPrev - i)) })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true, date: fmt(new Date(year, month, d)) })
  while (cells.length < 42)
    cells.push({ day: cells.length - firstDow - daysInMonth + 1, current: false, date: fmt(new Date(year, month + 1, cells.length - firstDow - daysInMonth + 1)) })

  const todoDates = new Set([...todos.map(t => t.date), ...history.map(e => e.date)])
  const todayStr  = fmt(today)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 transition-colors text-stone-400"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-xs font-semibold text-stone-600 tracking-wide">{MONTHS[month]} {year}</span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 transition-colors text-stone-400"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] text-stone-400 font-medium py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
          const isToday    = cell.date === todayStr
          const isSelected = cell.date === selectedDate
          const hasTodo    = todoDates.has(cell.date)
          return (
            <button
              key={i}
              onClick={() => onSelectDate(cell.date === selectedDate ? null : cell.date)}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-[11px] transition-all ${
                isSelected                 ? 'bg-stone-700 text-white font-semibold' :
                isToday                   ? 'bg-stone-200 text-stone-800 font-semibold' :
                cell.current              ? 'text-stone-600 hover:bg-stone-100' :
                                            'text-stone-300'
              }`}
            >
              {cell.day}
              {hasTodo && (
                <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-stone-400'}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
