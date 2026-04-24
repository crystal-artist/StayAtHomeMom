import { useRef, useState } from 'react'
import { MAX_PHOTOS_PER_DAY } from '../../hooks/usePhotos'

const COLLAPSED_LIMIT = 6

export default function PhotoDump({ date, photos, onAdd, onDelete }) {
  const libraryRef = useRef(null)
  const cameraRef  = useRef(null)
  const [sheet, setSheet]       = useState(false)
  const [preview, setPreview]   = useState(null)
  const [expanded, setExpanded] = useState(false)

  function handleFiles(e) {
    Array.from(e.target.files).forEach(f => onAdd(f, date))
    e.target.value = ''
    setSheet(false)
  }

  function openSheet() {
    if (photos.length >= MAX_PHOTOS_PER_DAY) return
    setSheet(true)
  }

  const atLimit      = photos.length >= MAX_PHOTOS_PER_DAY
  const hasMore      = photos.length > COLLAPSED_LIMIT
  const visiblePhotos = (expanded || !hasMore) ? photos : photos.slice(0, COLLAPSED_LIMIT)

  const CameraIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="5" width="20" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="11" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 5L8.5 2H13.5L15 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const GalleryIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="12" y="1" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="12" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="12" y="12" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )

  return (
    <div className="mt-8 pb-4 fade-slide-up" style={{ animationDelay: '400ms' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between mb-3"
        style={{ opacity: sheet ? 0.35 : 1, transition: 'opacity 0.3s ease' }}
      >
        <div>
          <p className="text-[11px] tracking-[0.18em] text-stone-400 font-medium">PHOTO DUMP</p>
          <p className="text-xs text-stone-400 mt-0.5">{date} · {photos.length}/{MAX_PHOTOS_PER_DAY}</p>
        </div>
        {!atLimit && (
          <button
            onClick={openSheet}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 2.5L5.5 1H8.5L9.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add photo
          </button>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={libraryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFiles} />

      {/* Photo grid or empty state */}
      {photos.length === 0 ? (
        <button
          onClick={openSheet}
          className="w-full rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center py-10 gap-2 text-stone-300 hover:border-stone-300 hover:text-stone-400 transition-colors"
          style={{ opacity: sheet ? 0.35 : 1, transition: 'opacity 0.3s ease' }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5L11 2H17L19 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs tracking-wide">Capture today's moments</span>
        </button>
      ) : (
        <>
          {/* Grid with fade overlay */}
          <div
            className="relative"
            style={{ opacity: sheet ? 0.35 : 1, transition: 'opacity 0.3s ease' }}
          >
            <div className="grid grid-cols-2 gap-2">
              {visiblePhotos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="relative rounded-2xl overflow-hidden aspect-square group fade-slide-up cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => setPreview(photo)}
                >
                  <img src={photo.src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(date, photo.id) }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add more button — only show when not at limit and grid is visible */}
              {!atLimit && (
                <button
                  onClick={openSheet}
                  className="rounded-2xl border-2 border-dashed border-stone-200 aspect-square flex items-center justify-center text-stone-300 hover:border-stone-300 hover:text-stone-400 transition-colors"
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <line x1="11" y1="4" x2="11" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="4" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom fade — covers row 3 entirely, starts fading mid row 2 */}
            {hasMore && !expanded && (
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{ height: '56%', background: 'linear-gradient(to top, var(--page-bg) 35%, transparent 100%)' }}
              />
            )}
          </div>

          {/* Expand / collapse toggle */}
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
            >
              {expanded ? 'Show less' : `Show all ${photos.length} photos`}
              <svg
                width="11" height="11" viewBox="0 0 11 11" fill="none"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
              >
                <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </>
      )}

      {/* Action sheet */}
      {sheet && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 fade-slide-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="max-w-sm mx-auto px-4 pb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden mb-3 shadow-sm">
              <button
                onClick={() => cameraRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 py-4 active:bg-stone-50 transition-colors border-b border-stone-100"
              >
                <span className="text-stone-400"><CameraIcon /></span>
                <div className="text-left">
                  <p className="text-sm font-medium text-stone-700">Take photo</p>
                  <p className="text-xs text-stone-400 mt-0.5">Use your camera</p>
                </div>
              </button>
              <button
                onClick={() => libraryRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 py-4 active:bg-stone-50 transition-colors"
              >
                <span className="text-stone-400"><GalleryIcon /></span>
                <div className="text-left">
                  <p className="text-sm font-medium text-stone-700">Choose from library</p>
                  <p className="text-xs text-stone-400 mt-0.5">Select one or more photos</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setSheet(false)}
              className="w-full bg-white/95 backdrop-blur-sm rounded-2xl py-4 text-sm font-medium text-stone-400 active:bg-stone-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Full-screen preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6 fade-in"
          onClick={() => setPreview(null)}
        >
          <img src={preview.src} alt="" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => setPreview(null)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
