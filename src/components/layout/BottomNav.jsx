import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  {
    id: 'flow',
    label: 'FLOW',
    path: '/flow',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L13.5 8.5L20 9.3L15.5 13.5L16.9 20L11 16.8L5.1 20L6.5 13.5L2 9.3L8.5 8.5L11 2Z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'plan',
    label: 'PLAN',
    path: '/',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="15" y1="2" x2="15" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="2" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: 'reset',
    label: 'RESET',
    path: '/reset',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11C4 7.13 7.13 4 11 4C13.5 4 15.7 5.3 17 7.3"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M18 11C18 14.87 14.87 18 11 18C8.5 18 6.3 16.7 5 14.7"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <polyline points="17,4 17,7.5 13.5,7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="5,18 5,14.5 8.5,14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200" style={{ backgroundColor: 'var(--page-bg)' }}>
      <div className="max-w-sm mx-auto flex justify-around items-center py-3">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                isActive ? 'bg-stone-200 text-stone-800' : 'text-stone-400'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium tracking-widest">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
