export default function QuoteCard({ imageUrl, quote }) {
  return (
    <div className="relative rounded-2xl overflow-hidden h-48 mt-4">
      <img src={imageUrl} alt="inspiration" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 flex items-end p-4">
        <p className="text-white text-sm italic leading-snug">
          "{quote}"
        </p>
      </div>
    </div>
  )
}
