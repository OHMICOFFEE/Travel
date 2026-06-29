'use client'
import { useState } from 'react'
import DestinationCard from './DestinationCard'
import DetailPanel from './DetailPanel'
import BottomNav from './BottomNav'

interface Props {
  destinations: any[]
  wishlistIds: Set<string>
  userId: string
}

export default function DestinationSwiper({ destinations, wishlistIds, userId }: Props) {
  const [cur, setCur] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [wishlisted, setWishlisted] = useState<Set<string>>(wishlistIds)

  const dest = destinations[cur]

  async function toggleWishlist(id: string) {
    const next = new Set(wishlisted)
    next.has(id) ? next.delete(id) : next.add(id)
    setWishlisted(next)
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_id: id }),
    })
  }

  if (!dest) return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
      <p className="text-white/40">No experiences found</p>
    </div>
  )

  return (
    <div className="flex flex-col h-screen max-w-sm mx-auto bg-[#0d1b2a] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-12 pb-2 shrink-0">
        <h1 className="font-display italic text-xl text-white">Ailleurs</h1>
        <p className="text-xs text-white/35 tracking-widest uppercase">Cape Town</p>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {showDetail ? (
          <DetailPanel dest={dest} isWishlisted={wishlisted.has(dest.id)}
            onBack={() => setShowDetail(false)} onWishlist={() => toggleWishlist(dest.id)} />
        ) : (
          <DestinationCard dest={dest} isWishlisted={wishlisted.has(dest.id)}
            onTap={() => setShowDetail(true)} onWishlist={() => toggleWishlist(dest.id)} />
        )}
      </div>

      {!showDetail && (
        <>
          <div className="flex justify-center gap-1.5 py-2 shrink-0">
            {destinations.map((_, i) => (
              <button key={i} onClick={() => { setCur(i); setShowDetail(false) }}
                className={`h-1.5 rounded-full transition-all ${i === cur ? 'bg-white w-5' : 'bg-white/25 w-1.5'}`} />
            ))}
          </div>
          {destinations.length > 1 && (
            <div className="flex gap-3 px-5 pb-2 shrink-0">
              <button onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0}
                className="flex-1 py-2.5 text-xs text-white/40 border border-white/10 rounded-xl disabled:opacity-20 hover:border-white/30 transition-colors">← prev</button>
              <button onClick={() => setCur(c => Math.min(destinations.length - 1, c + 1))} disabled={cur === destinations.length - 1}
                className="flex-1 py-2.5 text-xs text-white/40 border border-white/10 rounded-xl disabled:opacity-20 hover:border-white/30 transition-colors">next →</button>
            </div>
          )}
        </>
      )}
      <BottomNav active="explore" />
    </div>
  )
}
