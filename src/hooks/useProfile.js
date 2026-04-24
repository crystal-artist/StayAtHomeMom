import { useState, useEffect, useCallback } from 'react'

function generateId() {
  return 'ARC-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function compressAvatar(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 200
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = url
  })
}

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  accountId: generateId(),
  avatarType: 'cartoon',   // 'cartoon' | 'upload'
  avatarIndex: 0,
  avatarSrc: null,
  memberSince: null,       // { year, month, day }
  faceId: false,
  notifications: true,
}

function load() {
  try {
    const s = localStorage.getItem('archive_profile')
    return s ? { ...DEFAULT_PROFILE, ...JSON.parse(s) } : DEFAULT_PROFILE
  } catch { return DEFAULT_PROFILE }
}

export function useProfile() {
  const [profile, setProfile] = useState(load)

  useEffect(() => {
    try { localStorage.setItem('archive_profile', JSON.stringify(profile)) }
    catch {}
  }, [profile])

  const update = useCallback((patch) => setProfile(p => ({ ...p, ...patch })), [])

  const setAvatar = useCallback(async (file) => {
    const src = await compressAvatar(file)
    setProfile(p => ({ ...p, avatarType: 'upload', avatarSrc: src }))
  }, [])

  const setCartoonAvatar = useCallback((index) => {
    setProfile(p => ({ ...p, avatarType: 'cartoon', avatarIndex: index }))
  }, [])

  return { profile, update, setAvatar, setCartoonAvatar }
}

export const CARTOON_AVATARS = [
  { emoji: '🌸', bg: '#fce7f3' },
  { emoji: '🌿', bg: '#d1fae5' },
  { emoji: '☀️', bg: '#fef3c7' },
  { emoji: '🦋', bg: '#ede9fe' },
  { emoji: '🌈', bg: '#e0f2fe' },
  { emoji: '⭐', bg: '#fef9c3' },
  { emoji: '🍀', bg: '#dcfce7' },
  { emoji: '🌙', bg: '#e0e7ff' },
]

export function getDuration(memberSince) {
  if (!memberSince) return null
  const start = new Date(memberSince.year, memberSince.month - 1, memberSince.day)
  const now   = new Date()
  let years  = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years < 0 || (years === 0 && months <= 0)) return null
  const parts = []
  if (years > 0)  parts.push(`${years} year${years > 1 ? 's' : ''}`)
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`)
  return parts.join(', ')
}
