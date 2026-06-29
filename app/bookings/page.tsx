import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react'

export default async function BookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, destinations(name, location, duration)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-400/15 text-green-400 border-green-400/20',
    pending: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
    cancelled: 'bg-red-400/15 text-red-400 border-red-400/20',
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a] px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/destinations" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-medium text-white">Your bookings</h1>
      </div>
      {(!bookings || bookings.length === 0) ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm mb-4">No bookings yet</p>
          <Link href="/destinations" className="text-white/60 text-sm underline hover:text-white">Explore experiences</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-medium text-white text-base">{booking.destinations?.name}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={11} className="text-white/40" />
                    <p className="text-xs text-white/40">{booking.destinations?.location}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/50 pt-3 border-t border-white/8">
                <div className="flex items-center gap-1.5"><Calendar size={12} />
                  <span>{new Date(booking.booking_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5"><Users size={12} /><span>{booking.guests} guests</span></div>
                <div className="ml-auto font-medium text-white/70">R{booking.total_price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
