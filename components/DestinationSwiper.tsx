'use client'

import { useState } from 'react'
import { Destination } from '@/lib/supabase/database.types'
import DestinationCard from './DestinationCard'
import DetailPanel from './DetailPanel'
import BottomNav from './BottomNav'
import { useRouter } from 'next/navigation'

interface Props {
  destinations: Destination[]
  wishlistIds: Set<string>
  userId: string
}

export default function DestinationSwiper({ destinations, wishlistIds, userId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [wishlisted, setWishlisted] = useState<Set<string>>(wishlistIds)
  const router = useRouter()

  const current = destinations[currentIndex]

  function goTo(idx: number) {
    if (idx < 0 || idx >= destinations.length) return
    setCurrentIndex(idx)
    setShowDetail(false)
  }

  async function toggleWishlist(destinationId: string) {
    const newSet = new Set(wishlisted)
    if (newSet.has(destinationId)) {
      newSet.delete(destinationId)
    } else {
      newSet.add(destinationId)
    }
    setWishlisted(newSet)

    await fetch('/api/destinations/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_id: destinationId }),
    })
  }

  if (!current) {
    return (
      <div className="min-h-dvh bg-[#0d1b2a] flex items-center justify-center">
        <p className="text-white/40 text-sm">No experiences found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#0d1b2a] max-w-sm mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 z-10">
        <h1 className="font-display italic text-xl text-white tracking-wide">Ailleurs</h1>
        <p className="text-xs text-white/35 tracking-widest uppercase">Cape Town</p>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        {showDetail ? (
          <DetailPanel
            destination={current}
            isWishlisted={wishlisted.has(current.id)}
            onBack={() => setShowDetail(false)}
            onWishlist={() => toggleWishlist(current.id)}
            userId={userId}
          />
        ) : (
          <DestinationCard
            destination={current}
            isWishlisted={wishlisted.has(current.id)}
            onTap={() => setShowDetail(true)}
            onWishlist={() => toggleWishlist(current.id)}
          />
        )}
      </div>

      {/* Dot indicators */}
      {!showDetail && (
        <div className="flex justify-center gap-1.5 py-3">
          {destinations.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-white w-5'
                  : 'bg-white/25 w-1.5'
              }`}
              aria-label={`Go to experience ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe nav buttons */}
      {!showDetail && destinations.length > 1 && (
        <div className="flex gap-3 px-5 pb-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-1 py-2.5 text-xs text-white/40 border border-white/10 rounded-xl disabled:opacity-20 hover:border-white/30 transition-colors tracking-wide"
          >
            ← prev
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === destinations.length - 1}
            className="flex-1 py-2.5 text-xs text-white/40 border border-white/10 rounded-xl disabled:opacity-20 hover:border-white/30 transition-colors tracking-wide"
          >
            next →
          </button>
        </div>
      )}

      <BottomNav active="explore" />
    </div>
  )
}
