import { useState } from 'react'

// ── Errand type definitions ────────────────────────────────────────────────────
const ERRAND_TYPES = [
  {
    key: 'appointment',
    keywords: ['送', '接', '比赛', '课', '幼儿园', '学校', '孩子', '小孩', '医院', '诊所', '医生', '挂号', '看诊', '约',
               'school', 'drop', 'pickup', 'game', 'match', 'doctor', 'appointment', 'class'],
    icon: '🎯',
    bg: '#fce7f3',
    priority: 0,
    tip: 'Time-locked — anchor your whole day around this first.',
    estimate: 60,
  },
  {
    key: 'government',
    keywords: ['政府', '文件', '证件', '办证', '公务', '机构', '办理', '政务', '签证', '户口', '护照',
               'government', 'document', 'visa', 'permit', 'city hall', 'DMV', 'passport'],
    icon: '🏛️',
    bg: '#e0e7ff',
    priority: 1,
    tip: 'Go as early as you can — queues fill up fast after 9 AM.',
    estimate: 45,
  },
  {
    key: 'bank',
    keywords: ['银行', 'bank', 'ATM', '取钱', '汇款', '转账', '开户'],
    icon: '🏦',
    bg: '#d1fae5',
    priority: 2,
    tip: 'Weekday mornings are quietest. Have your ID and any cards ready.',
    estimate: 30,
  },
  {
    key: 'postal',
    keywords: ['邮局', '寄', '快递', '包裹', 'post', 'mail', 'parcel', '寄件', '取件', '快件'],
    icon: '📮',
    bg: '#fef3c7',
    priority: 3,
    tip: 'Usually 10–15 minutes. If you can, pre-fill labels at home.',
    estimate: 15,
  },
  {
    key: 'pharmacy',
    keywords: ['药', '药店', '药房', 'pharmacy', '配药', '取药', '处方'],
    icon: '💊',
    bg: '#fde68a',
    priority: 4,
    tip: 'Call ahead to confirm your prescription is ready for pick-up.',
    estimate: 15,
  },
  {
    key: 'shopping',
    keywords: ['购物', '超市', '买', '商场', '市场', 'shop', 'grocery', 'market', '菜', '食材', '买东西', '百货'],
    icon: '🛒',
    bg: '#f0fdf4',
    priority: 10,  // Always last
    tip: 'Always save shopping for last — groceries are heavy and perishables need to get home.',
    estimate: 45,
  },
]

const GENERIC = {
  key: 'generic',
  icon: '✅',
  bg: '#f5f5f4',
  priority: 5,
  tip: 'Batch with nearby stops to minimize back-tracking.',
  estimate: 20,
}

const STEP_LABELS = ['First up', 'Then', 'After that', 'Next', 'Following that', 'Then', 'And then', 'Finally']

// ── Parsing logic ──────────────────────────────────────────────────────────────
function classify(text) {
  const lower = text.toLowerCase()
  for (const type of ERRAND_TYPES) {
    if (type.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return type
    }
  }
  return GENERIC
}

function parseErrands(input) {
  const segments = input
    .split(/[，、,;；\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 1)
    .slice(0, 8)

  const items = segments.map(raw => ({ raw, ...classify(raw) }))
  items.sort((a, b) => a.priority - b.priority || 0)
  return items
}

function estimateTotal(items) {
  const travel = (items.length - 1) * 15
  const errand = items.reduce((s, i) => s + (i.estimate || 20), 0)
  const total  = errand + travel
  const h = Math.floor(total / 60)
  const m = total % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m} min`
}

function proTip(items) {
  if (items.some(i => i.key === 'government') && items.some(i => i.key === 'appointment'))
    return 'Head straight to the government office after your drop-off — early birds beat the queues.'
  if (items.some(i => i.key === 'shopping'))
    return 'Groceries are last for a reason — nothing worse than warm milk in a hot car.'
  if (items.filter(i => i.key === 'postal' || i.key === 'bank' || i.key === 'pharmacy').length >= 2)
    return 'Try to cluster the quick stops by location — saves a surprising amount of time.'
  return 'Pack water and a snack for yourself. Errands on an empty stomach take twice as long.'
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </span>
  )
}

function PlanResult({ items, onReset }) {
  return (
    <div className="fade-slide-up" style={{ animationDelay: '0ms' }}>
      {/* Steps */}
      <div className="bg-white rounded-2xl p-4 mb-2">
        <p className="text-[11px] tracking-[0.12em] text-stone-400 mb-4">YOUR OPTIMISED ROUTE</p>
        <div className="flex flex-col gap-1">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start fade-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
              {/* Icon + connector */}
              <div className="flex flex-col items-center gap-0 flex-shrink-0" style={{ marginTop: 2 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: item.bg }}>
                  {item.icon}
                </div>
                {i < items.length - 1 && <div className="w-px flex-1 bg-stone-100 my-1" style={{ minHeight: 12 }} />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-3">
                <p className="text-[10px] text-stone-300 font-medium uppercase tracking-wide mb-0.5">
                  {STEP_LABELS[i] || `Step ${i + 1}`}
                </p>
                <p className="text-sm font-medium text-stone-700 leading-snug">{item.raw}</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="rounded-2xl px-4 py-3 flex items-start justify-between gap-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div>
          <p className="text-xs font-medium text-stone-600">{estimateTotal(items)} total · {items.length} stops</p>
          <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{proTip(items)}</p>
        </div>
      </div>

      <button onClick={onReset} className="mt-3 w-full text-center text-xs text-stone-300 hover:text-stone-500 transition-colors py-1">
        Plan a different day
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AIPlanner() {
  const [input, setInput]   = useState('')
  const [plan, setPlan]     = useState(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!input.trim() || loading) return
    setLoading(true)
    setPlan(null)
    await new Promise(r => setTimeout(r, 1500))
    setPlan(parseErrands(input))
    setLoading(false)
  }

  function reset() {
    setPlan(null)
    setInput('')
  }

  return (
    <div className="mb-8 fade-slide-up" style={{ animationDelay: '220ms' }}>
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium">DAY PLANNER</p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 font-medium tracking-wide">AI</span>
      </div>

      {!plan ? (
        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs text-stone-400 leading-relaxed mb-3">
            Tell me what you need to do today — I'll work out the most efficient order for you.
          </p>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
            placeholder={'e.g. Drop off at soccer game, government documents, post office, groceries'}
            className="w-full text-sm text-stone-700 bg-stone-50 rounded-xl px-3 py-2.5 outline-none resize-none placeholder-stone-300 leading-relaxed"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-stone-300">Separate tasks with commas</span>
            <button
              onClick={generate}
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              {loading ? <ThinkingDots /> : (
                <>
                  Plan my day
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5H9M9 5.5L6 2.5M9 5.5L6 8.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <PlanResult items={plan} onReset={reset} />
      )}
    </div>
  )
}
