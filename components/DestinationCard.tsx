'use client'

import { Destination } from '@/lib/supabase/database.types'
import { Heart, Share2, Star, MapPin, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface Props {
  destination: Destination
  isWishlisted: boolean
  onTap: () => void
  onWishlist: () => void
}

// Fallback gradient images by category
const categoryGradients: Record<string, string> = {
  adventure: 'from-[#0d2240] via-[#1a4a6e] to-[#3a7090]',
  wildlife: 'from-[#0a3020] via-[#1a5a3a] to-[#3a9080]',
  wine: 'from-[#2a1a08] via-[#6a3a10] to-[#c07030]',
  culture: 'from-[#1a0a28] via-[#3a1a4a] to-[#7a4a8a]',
}

export default function DestinationCard({ destination, isWishlisted, onTap, onWishlist }: Props) {
  const gradient = categoryGradients[destination.category] ?? categoryGradients.adventure

  return (
    <div
      className="relative w-full h-full min-h-[500px] cursor-pointer select-none"
      onClick={onTap}
    >
      {/* Background image or gradient */}
      {destination.image_url ? (
        <Image
          src={destination.image_url}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      )}

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Top actions */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        {/* Points badge */}
        <div className="flex items-center gap-1.5 bg-black/30 border border-white/30 rounded-full px-3 py-1.5">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-white">{destination.points} pts</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={e => { e.stopPropagation(); navigator.share?.({ title: destination.name, text: destination.description }) }}
            className="w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Share"
          >
            <Share2 size={15} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onWishlist() }}
            className="w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center transition-colors hover:bg-black/50"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={15}
              className={isWishlisted ? 'text-red-400 fill-red-400' : 'text-white'}
            />
          </button>
        </div>
      </div>

      {/* Featured badge */}
      {destination.featured && (
        <div className="absolute top-16 left-4 z-10">
          <span className="text-[10px] uppercase tracking-widest bg-[#c9a84c]/90 text-[#0d1b2a] font-medium px-3 py-1 rounded-full">
            Most popular
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">{destination.category}</p>
        <h2 className="font-display italic text-3xl text-white leading-tight mb-1">
          {destination.name}
        </h2>
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin size={12} className="text-white/50" />
          <p className="text-xs text-white/55">{destination.location}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-0.5">from</p>
          <p className="text-4xl font-semibold text-white leading-none">
            R{destination.price.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">per person · {destination.duration}</p>
        </div>

        {/* Tap hint */}
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <span>Tap to see details</span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  )
}
