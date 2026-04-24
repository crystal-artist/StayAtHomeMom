import { useProfile, CARTOON_AVATARS } from '../../hooks/useProfile'

export default function Header({ onMenuClick }) {
  const { profile } = useProfile()
  const av = CARTOON_AVATARS[profile.avatarIndex] || CARTOON_AVATARS[0]

  return (
    <div className="flex items-center justify-between px-6 pt-12 pb-4">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="text-stone-500 hover:text-stone-700 transition-colors">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <span className="text-2xl font-semibold text-stone-800 tracking-wide">Archive</span>
      </div>

      <button onClick={onMenuClick} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: profile.avatarType === 'upload' ? '#e7e5e4' : av.bg }}>
        {profile.avatarType === 'upload' && profile.avatarSrc ? (
          <img src={profile.avatarSrc} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-lg">{av.emoji}</span>
        )}
      </button>
    </div>
  )
}
