import { useRef, useState } from 'react'
import { useProfile, CARTOON_AVATARS, getDuration } from '../../hooks/useProfile'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i)

function AvatarDisplay({ profile, size = 72, onClick }) {
  const av = CARTOON_AVATARS[profile.avatarIndex] || CARTOON_AVATARS[0]
  return (
    <button
      onClick={onClick}
      className="rounded-full overflow-hidden flex-shrink-0 relative"
      style={{ width: size, height: size, backgroundColor: profile.avatarType === 'upload' ? '#e7e5e4' : av.bg }}
    >
      {profile.avatarType === 'upload' && profile.avatarSrc ? (
        <img src={profile.avatarSrc} alt="" className="w-full h-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.48, lineHeight: 1 }} className="flex items-center justify-center w-full h-full">
          {av.emoji}
        </span>
      )}
      {onClick && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-end justify-center pb-1 transition-colors">
          <span className="text-[9px] text-white/90 font-medium bg-black/30 rounded-full px-1.5">edit</span>
        </div>
      )}
    </button>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ backgroundColor: value ? '#44403c' : '#d6d3d1' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function AvatarPicker({ profile, onCartoon, onUpload, onClose }) {
  const fileRef = useRef(null)
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative max-w-sm w-full px-4 pb-8 fade-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-3">
          <p className="text-xs tracking-[0.18em] text-stone-400 font-medium px-5 pt-4 pb-3">CHOOSE AVATAR</p>
          <div className="grid grid-cols-4 gap-3 px-5 pb-4">
            {CARTOON_AVATARS.map((av, i) => (
              <button
                key={i}
                onClick={() => { onCartoon(i); onClose() }}
                className="aspect-square rounded-2xl flex items-center justify-center text-2xl transition-transform active:scale-95"
                style={{
                  backgroundColor: av.bg,
                  outline: profile.avatarType === 'cartoon' && profile.avatarIndex === i ? '2px solid #44403c' : 'none',
                  outlineOffset: 2,
                }}
              >
                {av.emoji}
              </button>
            ))}
          </div>
          <div className="border-t border-stone-100 mx-5" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-stone-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 3L7.2 1H10.8L12 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-stone-700">Upload a photo</p>
              <p className="text-xs text-stone-400">Use your own picture</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) { onUpload(e.target.files[0]); onClose() } }} />
        </div>
        <button onClick={onClose} className="w-full bg-white rounded-2xl py-4 text-sm font-medium text-stone-400 active:bg-stone-50 shadow-sm">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AccountDrawer({ open, onClose }) {
  const { profile, update, setAvatar, setCartoonAvatar } = useProfile()
  const [pickerOpen, setPickerOpen]   = useState(false)
  const [helpOpen, setHelpOpen]       = useState(false)
  const [copied, setCopied]           = useState(false)

  const duration = getDuration(profile.memberSince)

  const daysInMonth = profile.memberSince
    ? new Date(profile.memberSince.year, profile.memberSince.month, 0).getDate()
    : 31

  function copyId() {
    navigator.clipboard?.writeText(profile.accountId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <>
      {/* Root — fixed full-viewport with overflow-hidden so the panel clips at the left edge */}
      <div
        className="fixed inset-0 z-40 overflow-hidden"
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
          onClick={onClose}
        />

        {/* Panel — anchored to viewport left so translateX(-100%) exits the screen cleanly */}
        <div
          className="absolute inset-y-0 left-0 bg-white shadow-2xl overflow-y-auto"
          style={{ width: 'min(85vw, 326px)', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 pt-14 pb-6">
            <span className="text-[11px] tracking-[0.2em] text-stone-400 font-medium">ACCOUNT</span>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* ── SECTION 1: Profile ── */}
          <div className="px-5 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-4 mb-5">
              <AvatarDisplay profile={profile} size={68} onClick={() => setPickerOpen(true)} />
              <div className="flex-1 min-w-0">
                <input
                  value={profile.name}
                  onChange={e => update({ name: e.target.value })}
                  placeholder="Your name"
                  className="w-full text-base font-semibold text-stone-800 bg-transparent outline-none placeholder-stone-300 border-b border-transparent focus:border-stone-200 pb-0.5 transition-colors"
                />
                <input
                  value={profile.email}
                  onChange={e => update({ email: e.target.value })}
                  placeholder="email@example.com"
                  type="email"
                  className="w-full text-xs text-stone-400 bg-transparent outline-none placeholder-stone-300 mt-1 border-b border-transparent focus:border-stone-200 pb-0.5 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={copyId}
              className="flex items-center gap-2 text-[11px] text-stone-300 hover:text-stone-400 transition-colors"
            >
              <span className="font-mono tracking-wide">{profile.accountId}</span>
              {copied ? (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="#86efac" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><path d="M3 3V2C3 1.45 3.45 1 4 1H9C9.55 1 10 1.45 10 2V7C10 7.55 9.55 8 9 8H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>

          {/* ── SECTION 2: Member Since ── */}
          <div className="px-5 py-6 border-b border-stone-100">
            <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium mb-1">MEMBER SINCE</p>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Set the date you started your full-time mom journey.
            </p>

            <div className="flex gap-2 mb-4">
              {/* Year */}
              <select
                value={profile.memberSince?.year || ''}
                onChange={e => update({ memberSince: { ...(profile.memberSince || { month: 1, day: 1 }), year: Number(e.target.value) } })}
                className="flex-1 text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-xl px-2 py-2 outline-none"
              >
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Month */}
              <select
                value={profile.memberSince?.month || ''}
                onChange={e => update({ memberSince: { ...(profile.memberSince || { year: CURRENT_YEAR, day: 1 }), month: Number(e.target.value) } })}
                className="flex-[1.4] text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-xl px-2 py-2 outline-none"
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>

              {/* Day */}
              <select
                value={profile.memberSince?.day || ''}
                onChange={e => update({ memberSince: { ...(profile.memberSince || { year: CURRENT_YEAR, month: 1 }), day: Number(e.target.value) } })}
                className="flex-1 text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-xl px-2 py-2 outline-none"
              >
                <option value="">Day</option>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {duration ? (
              <div className="bg-stone-50 rounded-2xl px-4 py-3">
                <p className="text-sm font-medium text-stone-700 leading-snug">
                  {duration} as a full-time mom
                </p>
                <p className="text-xs text-stone-400 mt-0.5">Every day counts. This will matter when you return.</p>
              </div>
            ) : profile.memberSince ? (
              <p className="text-xs text-stone-300 italic">Set a past date to see your journey duration.</p>
            ) : null}
          </div>

          {/* ── SECTION 3: Security ── */}
          <div className="px-5 py-6">
            <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium mb-4">SECURITY</p>

            <div className="flex flex-col gap-0 bg-stone-50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-700">Face ID</p>
                  <p className="text-xs text-stone-400 mt-0.5">Unlock with your face</p>
                </div>
                <Toggle value={profile.faceId} onChange={v => update({ faceId: v })} />
              </div>

              <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-700">Notifications</p>
                  <p className="text-xs text-stone-400 mt-0.5">Daily reminders & check-ins</p>
                </div>
                <Toggle value={profile.notifications} onChange={v => update({ notifications: v })} />
              </div>

              <button
                onClick={() => setHelpOpen(h => !h)}
                className="flex items-center justify-between px-4 py-3.5 w-full active:bg-stone-100 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-stone-700">Help & Policies</p>
                  <p className="text-xs text-stone-400 mt-0.5">Privacy, terms, support</p>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: helpOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M4 2L8 6L4 10" stroke="#a8a29e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {helpOpen && (
                <div className="px-4 pb-4 fade-in">
                  {['Privacy Policy', 'Terms of Service', 'Contact Support', 'About Archive'].map(item => (
                    <button key={item} className="w-full text-left text-xs text-stone-400 py-2 border-b border-stone-100 last:border-0 hover:text-stone-600 transition-colors">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Version */}
          <p className="text-center text-[10px] text-stone-300 pb-12">Archive v1.0.0</p>
        </div>
      </div>

      {/* Avatar picker sheet */}
      {pickerOpen && (
        <AvatarPicker
          profile={profile}
          onCartoon={setCartoonAvatar}
          onUpload={setAvatar}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
