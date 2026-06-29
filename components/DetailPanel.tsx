'use client'
import { useState } from 'react'
import { ArrowLeft, Heart, Star, MapPin, Check, Calendar, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

const gradients: Record<string, string> = {
  adventure: 'from-[#0d2240] to-[#3a7090]',
  wildlife: 'from-[#0a3020] to-[#3a9080]',
  wine: 'from-[#2a1a08] to-[#c07030]',
  culture: 'from-[#1a0a28] to-[#7a4a8a]',
}

export default function DetailPanel({ dest, isWishlisted, onBack, onWishlist }: any) {
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const router = useRouter()
  const total = (dest.price ?? 0) * guests
  const grad = gradients[dest.category] ?? gradients.adventure

  async function book() {
    if (!date) return
    setStatus('loading')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_id: dest.id, guests, booking_date: date }),
    })
    if (res.ok) { setStatus('success'); setTimeout(() => router.push('/bookings'), 1500) }
    else { setStatus('error'); setTimeout(() => setStatus('idle'), 3000) }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
      <div className={`relative h-52 shrink-0 bg-gradient-to-b ${grad}`}>
        {dest.image_url && <img src={dest.image_url} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white z-10">
          <ArrowLeft size={16} />
        </button>
        <button onClick={onWishlist} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center z-10">
          <Heart size={15} className={isWishlisted ? 'text-red-400 fill-red-400' : 'text-white'} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h2 className="font-display italic text-2xl text-white leading-tight">{dest.name}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-white/55" />
            <p className="text-xs text-white/55">{dest.location}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 pb-4 space-y-5 bg-[#0d1b2a]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/35 mb-0.5">from</p>
            <p className="text-3xl font-semibold text-white">R{dest.price?.toLocaleString()} <span className="text-base font-normal text-white/35">/ person</span></p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5">
            <Star size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">{dest.points} pts</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <span className="text-xs font-medium text-white bg-white/10 px-3 py-1.5 rounded-lg">{dest.schedule}</span>
          <span className="text-xs text-white/45">{dest.duration}</span>
        </div>

        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400" />)}
          <span className="text-sm font-medium text-white">{dest.rating}</span>
          <span className="text-xs text-white/35">({dest.review_count} reviews)</span>
        </div>

        <div>
          <p className="text-xs text-white/35 uppercase tracking-widest mb-2">About</p>
          <p className="text-sm text-white/65 leading-relaxed">{dest.description}</p>
        </div>

        {dest.includes?.length > 0 && (
          <div>
            <p className="text-xs text-white/35 uppercase tracking-widest mb-3">Included</p>
            <div className="grid grid-cols-2 gap-2">
              {dest.includes.map((item: string) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/60">
                  <Check size={13} className="text-teal-400 shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border border-white/10 rounded-2xl p-4 space-y-4">
          <p className="text-xs text-white/35 uppercase tracking-widest">Book this experience</p>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-white/45 mb-2"><Calendar size={11} /> Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/35 [color-scheme:dark]" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-white/45 mb-2"><Users size={11} /> Guests</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests(g => Math.max(1, g-1))} className="w-9 h-9 rounded-full border border-white/15 text-white text-lg hover:bg-white/10">−</button>
              <span className="text-white font-medium w-6 text-center">{guests}</span>
              <button onClick={() => setGuests(g => Math.min(10, g+1))} className="w-9 h-9 rounded-full border border-white/15 text-white text-lg hover:bg-white/10">+</button>
              <span className="text-xs text-white/35 ml-auto">Total: <strong className="text-white">R{total.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-2 bg-[#0d1b2a] shrink-0">
        <button onClick={book} disabled={!date || status === 'loading' || status === 'success'}
          className={`w-full py-4 rounded-2xl text-sm font-medium tracking-wide transition-all ${
            status === 'success' ? 'bg-teal-500 text-white' :
            status === 'error' ? 'bg-red-500/80 text-white' :
            'bg-white text-[#0d1b2a] hover:bg-white/90 disabled:opacity-40'}`}>
          {status === 'loading' ? 'Booking…' : status === 'success' ? '✓ Booked!' : status === 'error' ? 'Error — try again' : `Book now · R${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
