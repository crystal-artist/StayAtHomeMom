import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = [
  { id: 'default', name: 'Warm Stone',  required: 0,   bg: '#f0ede8', card: '#e8e4df', cardAlt: '#edeae5', accent: '#78716c', text: '#292524' },
  { id: 'sage',    name: 'Sage Garden', required: 50,  bg: '#e8ede8', card: '#d8e4d8', cardAlt: '#e5ece5', accent: '#4a7a45', text: '#1a2e1a' },
  { id: 'dusk',    name: 'Dusk Sky',    required: 150, bg: '#eceaf0', card: '#dcd8ea', cardAlt: '#e9e7f0', accent: '#6b5b8a', text: '#231b33' },
  { id: 'dawn',    name: 'Dawn Blush',  required: 300, bg: '#f2ebe8', card: '#e8d8d5', cardAlt: '#f0e8e6', accent: '#9b5a52', text: '#2c1512' },
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('archive_theme') || 'default')
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]

  useEffect(() => {
    localStorage.setItem('archive_theme', themeId)
    const r = document.documentElement
    r.style.setProperty('--page-bg', theme.bg)
    r.style.setProperty('--card-bg', theme.card)
    r.style.setProperty('--card-alt', theme.cardAlt)
    r.style.setProperty('--accent', theme.accent)
    r.style.setProperty('--text-primary', theme.text)
  }, [themeId, theme])

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
