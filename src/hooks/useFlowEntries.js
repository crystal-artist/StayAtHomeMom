import { useState, useEffect } from 'react'

const fmt = (d) => d.toISOString().split('T')[0]

const DEMO_ENTRIES = [
  { id: 1, time: '08:45 AM', date: fmt(new Date()), categoryId: 'parenting', activity: 'Morning routine', minutes: 45 },
  { id: 2, time: '10:15 AM', date: fmt(new Date()), categoryId: 'health',    activity: 'Medication',      minutes: 15 },
  { id: 3, time: '12:00 PM', date: fmt(new Date()), categoryId: 'home',      activity: 'Cooking',         minutes: 60 },
  { id: 4, time: '02:00 PM', date: fmt(new Date()), categoryId: 'parenting', activity: 'School pickup',   minutes: 30 },
  { id: 5, time: '03:20 PM', date: fmt(new Date()), categoryId: 'parenting', activity: 'Outdoor play',    minutes: 45 },
]

export function useFlowEntries() {
  const [entries, setEntries] = useState(() => {
    try {
      const s = localStorage.getItem('archive_flow')
      return s ? JSON.parse(s) : DEMO_ENTRIES
    } catch { return DEMO_ENTRIES }
  })

  useEffect(() => {
    localStorage.setItem('archive_flow', JSON.stringify(entries))
  }, [entries])

  return { entries, setEntries }
}
