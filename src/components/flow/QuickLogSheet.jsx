import { useState } from 'react'

export const CATEGORIES = [
  { id: 'parenting', label: 'Parenting', icon: '👶', bg: '#fce7f3' },
  { id: 'home',      label: 'Home Care', icon: '🏠', bg: '#fef3c7' },
  { id: 'health',    label: 'Health',    icon: '💊', bg: '#d1fae5' },
  { id: 'selfcare',  label: 'Self Care', icon: '✨', bg: '#f3e8ff' },
  { id: 'exercise',  label: 'Exercise',  icon: '🏃', bg: '#dcfce7' },
  { id: 'growth',    label: 'Growth',    icon: '📚', bg: '#e0e7ff' },
]

export const ACTIVITIES = {
  parenting: ['Morning routine', 'School pickup', 'Sports match', 'Playtime', 'Bedtime routine', 'Outdoor play', 'Arts & crafts', 'Bath time', 'Meltdown support', 'Reading together'],
  home:      ['Cooking', 'Grocery run', 'Deep clean', 'Laundry', 'Repair work', 'Garden', 'Organizing', 'Declutter', 'Bills & admin'],
  health:    ['Doctor visit', 'Medication', 'Therapy', 'Dentist', 'Vaccine', 'Meal prep', 'Health check', 'Mental check-in'],
  selfcare:  ['Journaling', 'Meditation', 'Reading', 'Quiet bath', 'Rest', 'Skincare', 'Nap', 'Quiet time', 'Creative hobby'],
  exercise:  ['Walk', 'Yoga', 'Run', 'Strength training', 'Stretching', 'Swim', 'Dance', 'Cycling', 'Home workout'],
  growth:    ['Podcast', 'Online course', 'Community event', 'Friend call', 'Family visit', 'Skill practice', 'Writing', 'Drawing'],
}

export function formatMin(m) {
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h}h ${r}m` : `${h}h`
}

// initialData: { categoryId, activity, minutes } — pre-fills minutes; always starts at category so everything is editable
export default function QuickLogSheet({ onAdd, onClose, initialData = null }) {
  const [step, setStep]         = useState('category')
  const [category, setCategory] = useState(null)
  const [activity, setActivity] = useState(null)
  const [minutes, setMinutes]   = useState(initialData?.minutes || 30)

  function pickCategory(cat) { setCategory(cat); setStep('activity') }
  function pickActivity(act)  { setActivity(act); setStep('time') }

  function back() {
    if (step === 'time')     { setStep('activity'); setActivity(null) }
    if (step === 'activity') { setStep('category'); setCategory(null) }
  }

  function confirm() {
    onAdd({ categoryId: category.id, activity, minutes })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'auto' }}>
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 max-w-sm mx-auto">
        <div className="bg-white rounded-t-3xl px-5 pt-4 pb-10 fade-slide-up" style={{ animationDelay: '0ms' }}>
          {/* Handle */}
          <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            {step !== 'category' ? (
              <button onClick={back} className="flex items-center gap-1 text-xs text-stone-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Back
              </button>
            ) : <div />}
            <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium">
              {step === 'category' ? 'WHAT ARE YOU DOING?' : step === 'activity' ? category.label.toUpperCase() : 'HOW LONG?'}
            </p>
            <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
          </div>

          {/* Step 1: Category grid */}
          {step === 'category' && (
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => pickCategory(cat)}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all active:scale-95"
                  style={{ backgroundColor: cat.bg }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[11px] font-medium text-stone-600 leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Activity chips */}
          {step === 'activity' && category && (
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES[category.id].map(act => (
                <button
                  key={act}
                  onClick={() => pickActivity(act)}
                  className="px-3.5 py-2 rounded-xl text-sm text-stone-600 font-medium transition-all active:scale-95"
                  style={{ backgroundColor: category.bg }}
                >
                  {act}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Time slider */}
          {step === 'time' && category && (
            <div>
              <div className="text-center mb-8">
                <p className="text-xs text-stone-400 mb-3">{category.icon} {activity}</p>
                <span
                  className="text-5xl font-light text-stone-800"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {formatMin(minutes)}
                </span>
              </div>

              <input
                type="range" min="15" max="240" step="15"
                value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <div className="flex justify-between text-[10px] text-stone-300 mt-1.5 mb-8">
                <span>15 min</span>
                <span>4 hours</span>
              </div>

              <button
                onClick={confirm}
                className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {initialData ? 'Save changes' : 'Add to timeline'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
