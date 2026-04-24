import { useState, useEffect, useCallback } from 'react'

const fmt = (d) => d.toISOString().split('T')[0]
const rel = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d) }

const DEMO_TODOS = [
  { id: 1, title: 'Visit government office for documents', priority: 'large',  done: false, date: rel(2) },
  { id: 2, title: 'Call plumber for pipe repair',          priority: 'medium', done: false, date: fmt(new Date()) },
  { id: 3, title: 'Buy eggs and milk',                     priority: 'small',  done: true,  date: fmt(new Date()) },
  { id: 4, title: "Child's vaccine appointment",           priority: 'large',  done: false, date: rel(5) },
  { id: 5, title: 'School sports day',                     priority: 'medium', done: false, date: rel(7) },
  { id: 6, title: 'Reply to school newsletter',            priority: 'small',  done: false, date: fmt(new Date()) },
]

export const POINTS = { small: 5, medium: 10, large: 20 }

export function useTodos() {
  const [todos, setTodos] = useState(() => {
    try {
      const s = localStorage.getItem('archive_todos')
      return s ? JSON.parse(s) : DEMO_TODOS
    } catch { return DEMO_TODOS }
  })

  // earnedPoints stored separately — deleting a completed todo never loses points
  const [earnedPoints, setEarnedPoints] = useState(() => {
    try {
      const s = localStorage.getItem('archive_points')
      if (s !== null) return Number(s)
      return DEMO_TODOS.filter(t => t.done).reduce((sum, t) => sum + POINTS[t.priority], 0)
    } catch { return 0 }
  })

  // history: permanent log of every completed task, keyed by the task's scheduled date
  // { id, title, priority, points, date, completedAt (timestamp) }
  const [history, setHistory] = useState(() => {
    try {
      const s = localStorage.getItem('archive_history')
      if (s) return JSON.parse(s)
      // Seed from any pre-completed demo todos
      return DEMO_TODOS.filter(t => t.done).map(t => ({
        id: `h_${t.id}`, title: t.title, priority: t.priority,
        points: POINTS[t.priority], date: t.date, completedAt: Date.now(),
      }))
    } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('archive_todos',   JSON.stringify(todos))         }, [todos])
  useEffect(() => { localStorage.setItem('archive_points',  String(earnedPoints))          }, [earnedPoints])
  useEffect(() => { localStorage.setItem('archive_history', JSON.stringify(history))       }, [history])

  const addTodo = useCallback((todo) => {
    setTodos(p => [...p, { ...todo, id: Date.now(), done: false }])
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(prev => {
      const todo = prev.find(t => t.id === id)
      if (!todo) return prev

      if (!todo.done) {
        // Completing: earn points + write to history
        setEarnedPoints(pts => pts + POINTS[todo.priority])
        setHistory(h => [...h, {
          id: `h_${todo.id}_${Date.now()}`,
          title: todo.title,
          priority: todo.priority,
          points: POINTS[todo.priority],
          date: todo.date,
          completedAt: Date.now(),
        }])
      } else {
        // Unchecking: refund points + remove most recent matching history entry
        setEarnedPoints(pts => Math.max(0, pts - POINTS[todo.priority]))
        setHistory(h => {
          const idx = [...h].reverse().findIndex(e => e.title === todo.title && e.date === todo.date)
          if (idx === -1) return h
          const realIdx = h.length - 1 - idx
          return h.filter((_, i) => i !== realIdx)
        })
      }

      return prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    })
  }, [])

  // Deleting a completed todo keeps both earned points and history intact
  const deleteTodo = useCallback((id) => {
    setTodos(p => p.filter(t => t.id !== id))
  }, [])

  return { todos, history, totalPoints: earnedPoints, addTodo, toggleTodo, deleteTodo }
}
