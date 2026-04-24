import { useState, useRef, useEffect } from 'react'
import { useFlowEntries } from '../hooks/useFlowEntries'
import QuickLogSheet, { CATEGORIES, formatMin } from '../components/flow/QuickLogSheet'
import DailySummary from '../components/flow/DailySummary'

const fmt        = (d) => d.toISOString().split('T')[0]
const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

// ── Tip pools ─────────────────────────────────────────────────────────────────
const TIPS = {
  tired: [
    { title: 'Rest if you can',        body: 'Even a 10-minute pause without screens can recalibrate your nervous system.' },
    { title: 'Quick energy recovery',  body: 'Try box breathing (4 counts in, hold, out, hold). Drink a glass of water. Step outside for 2 minutes.' },
    { title: 'Lower the bar',          body: 'Today, done is better than perfect. Give yourself permission to do less and rest more.' },
    { title: 'Hydrate intentionally',  body: 'Fatigue is often dehydration in disguise. Drink a full glass of water right now, slowly.' },
    { title: 'Warm something up',      body: 'A hot drink, a soft blanket. Comfort isn\'t indulgence — it\'s recovery.' },
    { title: 'Name it to tame it',     body: 'Say out loud: "I am tired and that is okay." Naming the feeling reduces its weight.' },
    { title: 'Five minutes outside',   body: 'Even slow movement and natural light shifts your body chemistry. You don\'t have to go far.' },
    { title: 'Do the smallest thing',  body: 'Pick the single smallest task on your list. One small completion builds just enough momentum.' },
  ],
  okay: [
    { title: 'Fold the laundry',       body: 'A tactile, low-stakes task that brings visible order. Good for a steady-pace kind of day.' },
    { title: 'Wipe down one surface',  body: 'The kitchen counter, the bathroom sink. Small physical resets signal care without draining you.' },
    { title: 'Water the plants',       body: 'Quiet, meditative, and nurturing. A gentle reminder that growth takes time.' },
    { title: 'Sort the mail or inbox', body: 'Low cognitive load, satisfying to clear. A few minutes that earn a sense of small completion.' },
    { title: 'Prep something for tomorrow', body: 'Lay out clothes, write a short list, pack the bag. Future-you will feel cared for.' },
    { title: 'Call someone you\'ve been meaning to', body: 'Connection doesn\'t need energy — it creates it.' },
    { title: 'Take a short walk',      body: 'Enough to change the scenery, reset perspective, and come back with fresh eyes.' },
    { title: 'Read a few pages',       body: 'Not to finish the book. Just to step somewhere else for a few quiet minutes.' },
  ],
  energetic: [
    { title: 'Brainstorm freely',       body: 'Open a blank page and write without editing. What have you been meaning to think through?' },
    { title: 'Try something new',       body: 'Is there a hobby you\'ve been curious about? Even 20 minutes of exploration plants a seed.' },
    { title: 'Tackle the avoided task', body: 'You have the energy. Use this window for the task that usually feels too heavy.' },
    { title: 'Learn one small thing',   body: 'A new recipe, a stretching routine, a word in another language. Staying curious is self-renewal.' },
    { title: 'Move your body',          body: 'Dance, stretch, walk fast, lift something. Let your energy express itself physically.' },
    { title: 'Write the message',       body: 'Use the clarity you have right now to say something that matters.' },
    { title: 'Start the project',       body: 'Not plan it — start it. Open the file, set up the materials, take the first real step.' },
    { title: 'Do something purely for joy', body: 'Not for the house, not for the kids. Something you would choose if no one was watching.' },
  ],
}

const MOOD_IMAGES = {
  tired:     'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80',
  okay:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  energetic: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
}

const INITIAL_INDICES = { tired: [0, 1, 2], okay: [0, 1, 2], energetic: [0, 1, 2] }

const moodOptions = [
  { id: 'tired',
    label: 'Tired', desc: 'Energy is low, focus is soft.',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.5 2 4 5 4 10C4 14 7.1 18 11.5 18C12.8 18 14 17.7 15 17C11.5 17 8.5 13.9 8.5 10C8.5 6.8 10.3 4.2 13.2 3C12.2 2.4 11.1 2 10 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { id: 'okay',
    label: 'Okay', desc: 'I have enough to keep moving at a steady pace.',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="10" r="2.5" fill="currentColor"/></svg> },
  { id: 'energetic',
    label: 'Energetic', desc: 'Feeling capable of tackling more demanding tasks.',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 2L5 12H10L8 18L15 8H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/></svg> },
]

// ── Confirm delete modal ───────────────────────────────────────────────────────
function ConfirmModal({ activity, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl fade-slide-up" style={{ animationDelay: '0ms' }}>
        <p className="text-sm font-semibold text-stone-700 mb-1">Delete this entry?</p>
        <p className="text-xs text-stone-400 leading-relaxed mb-5">
          {activity ? `"${activity}"` : 'This entry'} will be removed from your timeline.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="flex-1 py-2.5 bg-stone-100 rounded-xl text-sm text-stone-600 font-medium">Keep it</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-400 rounded-xl text-sm text-white font-medium">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Swipeable timeline entry ───────────────────────────────────────────────────
function FlowEntry({ entry, onDelete, onEdit }) {
  const [dx, setDx]           = useState(0)
  const [snapped, setSnapped] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const startX  = useRef(null)
  const startY  = useRef(null)
  const startDx = useRef(0)
  const SNAP    = 76

  function onPtrDown(e) { startX.current = e.clientX; startY.current = e.clientY; startDx.current = dx }
  function onPtrMove(e) {
    if (startX.current === null) return
    const raw = e.clientX - startX.current
    const base = snapped ? -SNAP : 0
    setDx(Math.max(-SNAP, Math.min(0, base + raw)))
  }
  function onPtrUp(e) {
    const movedX = Math.abs(dx - startDx.current)
    const movedY = startY.current != null ? Math.abs(e.clientY - startY.current) : 999
    if (movedX > SNAP / 2)                    { setDx(-SNAP); setSnapped(true) }
    else if (movedX < 6 && movedY < 8 && !snapped) { setDx(0); setSnapped(false); onEdit?.() }
    else                                       { setDx(0); setSnapped(false) }
    startX.current = null; startY.current = null
  }
  function onPtrLeave() {
    if (startX.current === null) return
    if (Math.abs(dx - startDx.current) > SNAP / 2) { setDx(-SNAP); setSnapped(true) }
    else { setDx(0); setSnapped(false) }
    startX.current = null; startY.current = null
  }

  function handleDeleteClick() { setConfirming(true) }

  function confirmDelete() {
    setConfirming(false)
    setDeleting(true)
    setTimeout(() => onDelete(), 320)
  }

  const cat = CATEGORIES.find(c => c.id === entry.categoryId)
  const isNew = !!cat
  const dotBg     = cat ? cat.bg : '#e7e5e4'
  const dotBorder = cat ? 'var(--accent)' : '#a8a29e'

  return (
    <>
      {/* Outer row: left column (dot+line) is NOT clipped; right column has overflow-hidden for swipe */}
      <div
        className="flex"
        style={{ opacity: deleting ? 0 : 1, maxHeight: deleting ? 0 : '200px', transition: deleting ? 'opacity 0.3s, max-height 0.3s' : 'none' }}
      >
        {/* Left: dot + vertical line — always fully visible */}
        <div className="flex flex-col items-center w-5 flex-shrink-0 pt-1.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotBg, border: `1.5px solid ${dotBorder}`, opacity: 0.9 }} />
          <div className="w-px flex-1 mt-1" style={{ backgroundColor: '#ddd9d5' }} />
        </div>

        {/* Right: swipeable area with overflow-hidden to clip delete zone */}
        <div className="flex-1 overflow-hidden relative">
          {/* Delete zone */}
          <div className="absolute inset-y-0 right-0 w-[76px] bg-red-400 flex items-center justify-center">
            <button onClick={handleDeleteClick} className="flex flex-col items-center gap-1 text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 5H13M5 5V3.5C5 3 5.5 2.5 6 2.5H10C10.5 2.5 11 3 11 3.5V5M6.5 8V12M9.5 8V12" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M4 5L4.5 13.5H11.5L12 5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] font-medium">Delete</span>
            </button>
          </div>

          {/* Sliding content */}
          <div
            style={{ transform: `translateX(${dx}px)`, transition: startX.current ? 'none' : 'transform 0.22s ease', touchAction: 'pan-y', backgroundColor: 'var(--page-bg)' }}
            onPointerDown={onPtrDown}
            onPointerMove={onPtrMove}
            onPointerUp={onPtrUp}
            onPointerLeave={onPtrLeave}
          >
            {isNew ? (
              <div className="pl-3 pr-2 pb-4">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm leading-none">{cat.icon}</span>
                    <span className="text-[10px] tracking-widest text-stone-400 font-medium">{cat.label.toUpperCase()}</span>
                  </div>
                  <span className="text-[10px] text-stone-300 flex-shrink-0 ml-2">{entry.time}</span>
                </div>
                <p className="text-sm font-medium text-stone-700 mb-2 leading-snug">{entry.activity}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (entry.minutes / 240) * 100)}%`, backgroundColor: 'var(--accent)', opacity: 0.55 }} />
                  </div>
                  <span className="text-[10px] text-stone-400 flex-shrink-0">{formatMin(entry.minutes)}</span>
                </div>
              </div>
            ) : (
              <div className="pl-3 pr-2 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] tracking-widest text-stone-400">NOTE</span>
                  <span className="text-[10px] text-stone-300">{entry.time}</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{entry.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmModal
          activity={entry.activity || entry.text}
          onConfirm={confirmDelete}
          onCancel={() => { setConfirming(false); setDx(0); setSnapped(false) }}
        />
      )}
    </>
  )
}

// ── Rec card with reload ───────────────────────────────────────────────────────
function RecCard({ tip, onReload }) {
  const [spinning, setSpinning] = useState(false)

  function handleReload() {
    setSpinning(true); onReload()
    setTimeout(() => setSpinning(false), 520)
  }

  return (
    <div className="relative bg-white rounded-2xl px-4 py-3.5 mb-2.5 fade-slide-up">
      <p className="text-sm font-semibold text-stone-700 mb-1 pr-8">{tip.title}</p>
      <p className="text-sm text-stone-500 leading-relaxed pr-8">{tip.body}</p>
      <button
        onClick={handleReload}
        className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-400 transition-colors"
        title="Try a different suggestion"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={spinning ? 'spin-once' : ''}>
          <path d="M10.5 4C9.6 2.8 8.1 2 6.5 2C4 2 2 4 2 6.5C2 9 4 11 6.5 11C8.6 11 10.4 9.7 11 7.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M10 2V4.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Flow() {
  const { entries, setEntries } = useFlowEntries()
  const [timelineOpen, setTimelineOpen] = useState(true)
  const [mood, setMood]                 = useState(null)
  const [cardIndices, setCardIndices]   = useState(INITIAL_INDICES)
  const [sheetOpen, setSheetOpen]       = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)   // entry obj when editing
  const [insertAfterId, setInsertAfterId] = useState(null) // id to insert after
  const nextId = useRef(Date.now())

  function handleDelete(id) { setEntries(prev => prev.filter(e => e.id !== id)) }

  function openAdd()            { setEditingEntry(null); setInsertAfterId(null); setSheetOpen(true) }
  function openEdit(entry)      { setEditingEntry(entry); setInsertAfterId(null); setSheetOpen(true) }
  function openInsert(afterId)  { setEditingEntry(null); setInsertAfterId(afterId); setSheetOpen(true) }
  function closeSheet()         { setSheetOpen(false); setEditingEntry(null); setInsertAfterId(null) }

  function handleSheetConfirm({ categoryId, activity, minutes }) {
    if (editingEntry) {
      setEntries(prev => prev.map(e =>
        e.id === editingEntry.id ? { ...e, categoryId, activity, minutes } : e
      ))
    } else {
      const newEntry = {
        id: nextId.current++,
        time: formatTime(new Date()),
        date: fmt(new Date()),
        categoryId, activity, minutes,
      }
      if (insertAfterId != null) {
        setEntries(prev => {
          const idx = prev.findIndex(e => e.id === insertAfterId)
          const copy = [...prev]
          copy.splice(idx + 1, 0, newEntry)
          return copy
        })
      } else {
        setEntries(prev => [...prev, newEntry])
      }
      if (!timelineOpen) setTimelineOpen(true)
    }
    closeSheet()
  }

  function reloadCard(moodId, pos) {
    setCardIndices(prev => {
      const pool = TIPS[moodId]
      const curr = [...prev[moodId]]
      const used = new Set(curr)
      let next = (curr[pos] + 1) % pool.length
      let t = 0
      while (used.has(next) && t++ < pool.length) next = (next + 1) % pool.length
      curr[pos] = next
      return { ...prev, [moodId]: curr }
    })
  }

  // Today's entries for the timeline display
  const today = fmt(new Date())
  const todayEntries = entries.filter(e => e.date === today)

  return (
    <div className="px-6 pt-6 pb-36 relative">
      <h1 className="text-3xl font-bold text-stone-800 leading-snug fade-slide-up"
        style={{ animationDelay: '0ms', fontFamily: "'Playfair Display', serif" }}>
        Today is unfolding.
      </h1>
      <div className="w-8 h-px bg-stone-300 mt-3 mb-6 fade-slide-up" style={{ animationDelay: '60ms' }} />

      {/* Timeline header */}
      <div className="flex items-center justify-between mb-3 fade-slide-up" style={{ animationDelay: '100ms' }}>
        <span className="text-[11px] tracking-[0.18em] text-stone-400 font-medium">TODAY'S MOMENTS</span>
        <button onClick={() => setTimelineOpen(o => !o)} className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors">
          {timelineOpen ? 'Collapse' : 'Expand'}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
            style={{ transform: timelineOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .3s' }}>
            <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="collapsible" style={{ maxHeight: timelineOpen ? '3000px' : '0px', opacity: timelineOpen ? 1 : 0 }}>
        {todayEntries.length === 0 && (
          <p className="text-sm text-stone-300 text-center py-6">Tap + to log your first moment today.</p>
        )}
        {todayEntries.map((entry, i) => (
          <div key={entry.id}>
            <FlowEntry
              entry={entry}
              onDelete={() => handleDelete(entry.id)}
              onEdit={() => openEdit(entry)}
            />
            {/* Insert-after button sits on the timeline line */}
            <div className="flex gap-3 -mt-2 mb-2">
              <div className="w-5 flex justify-center">
                <button
                  onClick={() => openInsert(entry.id)}
                  className="w-4 h-4 rounded-full border border-stone-300 bg-white hover:border-stone-500 flex items-center justify-center transition-colors"
                  title="Add entry here"
                >
                  <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                    <path d="M3.5 1v5M1 3.5h5" stroke="#a8a29e" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Log button inline */}
        <button
          onClick={openAdd}
          className="flex items-center gap-2 mt-1 mb-2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="7.5" y1="4.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="4.5" y1="7.5" x2="10.5" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-sm">Log a moment</span>
        </button>
      </div>

      {/* Daily summary visualization */}
      <DailySummary entries={entries} />

      <div className="w-full h-px bg-stone-200 my-8" />

      {/* Mood check-in */}
      <div className="fade-slide-up" style={{ animationDelay: '180ms' }}>
        <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium mb-3">CURRENT STATE</p>
        <h2 className="text-2xl font-bold text-stone-800 leading-snug mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          How are you feeling right now?
        </h2>

        <div className="flex flex-col gap-3">
          {moodOptions.map((opt, i) => {
            const selected = mood === opt.id
            const indices  = cardIndices[opt.id]
            const pool     = TIPS[opt.id]

            return (
              <div key={opt.id} className="fade-slide-up" style={{ animationDelay: `${220 + i * 70}ms` }}>
                <button
                  onClick={() => setMood(p => p === opt.id ? null : opt.id)}
                  className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-300"
                  style={{ backgroundColor: selected ? 'var(--card-alt)' : 'var(--card-bg)' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-stone-500 mb-2">{opt.icon}</div>
                      <p className="text-sm font-semibold text-stone-700">{opt.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                      className="mt-1 flex-shrink-0 transition-opacity duration-200"
                      style={{ opacity: selected ? 1 : 0 }}>
                      <circle cx="9" cy="9" r="8" fill="var(--accent)"/>
                      <path d="M5.5 9L8 11.5L12.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                <div className="collapsible" style={{ maxHeight: selected ? '900px' : '0px', opacity: selected ? 1 : 0 }}>
                  <div className="pt-3">
                    {indices.map((tipIdx, pos) => (
                      <RecCard
                        key={`${opt.id}-${pos}-${tipIdx}`}
                        tip={pool[tipIdx]}
                        onReload={() => reloadCard(opt.id, pos)}
                      />
                    ))}
                    <div className="rounded-2xl overflow-hidden mt-1 mb-2 h-36 bg-stone-200 fade-slide-up" style={{ animationDelay: '240ms' }}>
                      <img src={MOOD_IMAGES[opt.id]} alt="" className="w-full h-full object-cover opacity-70" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-24 right-6 w-12 h-12 bg-stone-700 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform z-30"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <line x1="10" y1="4" x2="10" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4" y1="10" x2="16" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Quick log sheet (add / edit) */}
      {sheetOpen && (
        <QuickLogSheet
          onAdd={handleSheetConfirm}
          onClose={closeSheet}
          initialData={editingEntry ? { categoryId: editingEntry.categoryId, activity: editingEntry.activity, minutes: editingEntry.minutes } : null}
        />
      )}
    </div>
  )
}
