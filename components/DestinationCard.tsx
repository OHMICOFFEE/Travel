'use client'
import { Heart, Share2, Star, MapPin, ChevronRight } from 'lucide-react'

const gradients: Record<string, string> = {
  adventure: 'from-[#0d2240] via-[#1a4a6e] to-[#3a7090]',
  wildlife: 'from-[#0a3020] via-[#1a5a3a] to-[#3a9080]',
  wine: 'from-[#2a1a08] via-[#6a3a10] to-[#c07030]',
  culture: 'from-[#1a0a28] via-[#3a1a4a] to-[#7a4a8a]',
}

export default function DestinationCard({ dest, isWishlisted, onTap, onWishlist }: any) {
  const grad = gradients[dest.category] ?? gradients.adventure
  return (
    <div className="relative w-full h-full cursor-pointer select-none" onClick={onTap}>
      {dest.image_url
        ? <img src={dest.image_url} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
        : <div className={`absolute inset-0 bg-gradient-to-b ${grad}`} />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 bg-black/30 border border-white/30 rounded-full px-3 py-1.5">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-white">{dest.points} pts</span>
        </div>
        <div className="flex gap-2">
          <button onClick={e => e.stopPropagation()} className="w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-white">
            <Share2 size={15} />
          </button>
          <button onClick={e => { e.stopPropagation(); onWishlist() }}
            className="w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center">
            <Heart size={15} className={isWishlisted ? 'text-red-400 fill-red-400' : 'text-white'} />
          </button>
        </div>
      </div>

      {dest.featured && (
        <div className="absolute top-16 left-4 z-10">
          <span className="text-[10px] uppercase tracking-widest bg-[#c9a84c]/90 text-[#0d1b2a] font-medium px-3 py-1 rounded-full">Most popular</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">{dest.category}</p>
        <h2 className="font-display italic text-3xl text-white leading-tight mb-1">{dest.name}</h2>
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin size={12} className="text-white/50" />
          <p className="text-xs text-white/55">{dest.location}</p>
        </div>
        <p className="text-xs text-white/40 mb-0.5">from</p>
        <p className="text-4xl font-semibold text-white leading-none">R{dest.price?.toLocaleString()}</p>
        <p className="text-xs text-white/40 mt-1 mb-4">per person · {dest.duration}</p>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <span>Tap to see details</span><ChevronRight size={13} />
        </div>
      </div>
    </div>
  )
}
