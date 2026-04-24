export default function TimeCard({ minutes, title, category }) {
  return (
    <div className="mb-2">
      <div className="bg-stone-100 rounded-2xl px-6 py-8 flex flex-col justify-center min-h-[120px]">
        <span
          className="text-7xl font-light text-stone-400 leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {minutes}
        </span>
        <span className="text-[11px] tracking-[0.2em] text-stone-400 mt-2 font-medium">
          MINUTES
        </span>
      </div>
      <div className="px-1 mt-3 mb-6">
        <p className="text-stone-700 text-base font-medium">{title}</p>
        <p className="text-[11px] tracking-[0.15em] text-stone-400 font-medium mt-0.5">
          {category}
        </p>
      </div>
    </div>
  )
}
