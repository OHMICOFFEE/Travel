'use client'

import { useState } from 'react'
import { Destination } from '@/lib/supabase/database.types'
import { ArrowLeft, Heart, Star, MapPin, Check, Calendar, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Props {
  destination: Destination
  isWishlisted: boolean
  onBack: () => void
  onWishlist: () => void
  userId: string
}

const categoryGradients: Record<string, string> = {
  adventure: 'from-[#0d2240] via-[#1a4a6e] to-[#3a7090]',
  wildlife: 'from-[#0a3020] via-[#1a5a3a] to-[#3a9080]',
  wine: 'from-[#2a1a08] via-[#6a3a10] to-[#c07030]',
  culture: 'from-[#1a0a28] via-[#3a1a4a] to-[#7a4a8a]',
}

export default function DetailPanel({ destination, isWishlisted, onBack, onWishlist, userId }: Props) {
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')
  const [booking, setBooking] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const router = useRouter()

  const gradient = categoryGradients[destination.category] ?? categoryGradients.adventure
  const total = destination.price * guests

  async function handleBook() {
    if (!date) return
    setBooking('loading')

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination_id: destination.id,
        guests,
        booking_date: date,
      }),
    })

    if (res.ok) {
      setBooking('success')
      setTimeout(() => router.push('/bookings'), 1500)
    } else {
      setBooking('error')
      setTimeout(() => setBooking('idle'), 3000)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar bg-[#0d1b2a]">
      {/* Image strip */}
      <div className="relative h-52 flex-shrink-0">
        {destination.image_url ? (
          <Image src={destination.image_url} alt={destination.name} fill className="object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white z-10 hover:bg-black/60 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={onWishlist}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center z-10 hover:bg-black/60 transition-colors"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} className={isWishlisted ? 'text-red-400 fill-red-400' : 'text-white'} />
        </button>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h2 className="font-display italic text-2xl text-white leading-tight">{destination.name}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-white/55" />
            <p className="text-xs text-white/55">{destination.location}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pt-5 pb-4 space-y-5">

        {/* Price + points */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/35 mb-0.5">from</p>
            <p className="text-3xl font-semibold text-white">
              R{destination.price.toLocaleString()}
              <span className="text-base font-normal text-white/35 ml-1">/ person</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5">
            <Star size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">{destination.points} pts earned</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center justify-between bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <span className="text-xs font-medium text-white bg-white/10 px-3 py-1.5 rounded-lg">
            {destination.schedule}
          </span>
          <span className="text-xs text-white/45">{destination.duration}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm font-medium text-white">{destination.rating}</span>
          <span className="text-xs text-white/35">({destination.review_count} reviews)</span>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-white/35 uppercase tracking-widest mb-2">About</p>
          <p className="text-sm text-white/65 leading-relaxed">{destination.description}</p>
        </div>

        {/* Includes */}
        <div>
          <p className="text-xs text-white/35 uppercase tracking-widest mb-3">What's included</p>
          <div className="grid grid-cols-2 gap-2">
            {destination.includes.map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/60">
                <Check size={13} className="text-teal-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Booking form */}
        <div className="border border-white/10 rounded-2xl p-4 space-y-4">
          <p className="text-xs text-white/35 uppercase tracking-widest">Book this experience</p>

          <div>
            <label className="block text-xs text-white/45 mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> Preferred date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/35 transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-2 flex items-center gap-1.5">
              <Users size={11} /> Guests
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-9 h-9 rounded-full border border-white/15 text-white text-lg hover:bg-white/10 transition-colors"
              >
                −
              </button>
              <span className="text-white font-medium w-6 text-center">{guests}</span>
              <button
                onClick={() => setGuests(g => Math.min(10, g + 1))}
                className="w-9 h-9 rounded-full border border-white/15 text-white text-lg hover:bg-white/10 transition-colors"
              >
                +
              </button>
              <span className="text-xs text-white/35 ml-auto">
                Total: <strong className="text-white">R{total.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Book button */}
      <div className="px-5 pb-6 pt-2">
        <button
          onClick={handleBook}
          disabled={!date || booking === 'loading' || booking === 'success'}
          className={`w-full py-4 rounded-2xl text-sm font-medium tracking-wide transition-all ${
            booking === 'success'
              ? 'bg-teal-500 text-white'
              : booking === 'error'
              ? 'bg-red-500/80 text-white'
              : 'bg-white text-[#0d1b2a] hover:bg-white/90 disabled:opacity-40'
          }`}
        >
          {booking === 'loading' && 'Booking…'}
          {booking === 'success' && '✓ Booked! Redirecting…'}
          {booking === 'error' && 'Something went wrong. Try again'}
          {booking === 'idle' && `Book now · R${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
