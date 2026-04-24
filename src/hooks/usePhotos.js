import { useState, useEffect, useCallback } from 'react'
import localforage from 'localforage'

const fmt = (d) => d.toISOString().split('T')[0]
export const MAX_PHOTOS_PER_DAY = 50

const store = localforage.createInstance({ name: 'archive', storeName: 'photos' })

const todayStr = fmt(new Date())
const DEMO_PHOTOS = {
  [todayStr]: [
    { id: 'demo_1', src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', type: 'url', timestamp: Date.now() - 5000 },
    { id: 'demo_2', src: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80', type: 'url', timestamp: Date.now() - 4000 },
    { id: 'demo_3', src: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80', type: 'url', timestamp: Date.now() - 3000 },
    { id: 'demo_4', src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', type: 'url', timestamp: Date.now() - 2000 },
    { id: 'demo_5', src: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80', type: 'url', timestamp: Date.now() - 1000 },
  ],
}

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 900
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = objectUrl
  })
}

export function usePhotos() {
  const [photos, setPhotos] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    store.getItem('all').then(data => {
      setPhotos(data || DEMO_PHOTOS)
      setLoaded(true)
    }).catch(() => {
      setPhotos(DEMO_PHOTOS)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    store.setItem('all', photos).catch(() => {})
  }, [photos, loaded])

  const addPhoto = useCallback(async (file, date = fmt(new Date())) => {
    const src = await compressImage(file)
    setPhotos(prev => {
      const dayPhotos = prev[date] || []
      if (dayPhotos.length >= MAX_PHOTOS_PER_DAY) return prev
      return {
        ...prev,
        [date]: [...dayPhotos, {
          id: `p_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          src,
          type: 'upload',
          timestamp: Date.now(),
        }],
      }
    })
  }, [])

  const deletePhoto = useCallback((date, id) => {
    setPhotos(prev => {
      const updated = (prev[date] || []).filter(p => p.id !== id)
      if (updated.length === 0) {
        const { [date]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [date]: updated }
    })
  }, [])

  const getPhotos = useCallback((date) => photos[date] || [], [photos])

  return { getPhotos, addPhoto, deletePhoto }
}
