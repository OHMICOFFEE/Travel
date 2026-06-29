'use client'
import Link from 'next/link'
import { Compass, Heart, Calendar, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BottomNav({ active }: { active: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex bg-[#0d1b2a] border-t border-white/8 shrink-0">
      {[
        { id: 'explore', icon: Compass, label: 'Explore', href: '/destinations' },
        { id: 'saved', icon: Heart, label: 'Saved', href: '/destinations' },
        { id: 'bookings', icon: Calendar, label: 'Bookings', href: '/bookings' },
      ].map(item => (
        <Link key={item.id} href={item.href} className="flex-1">
          <div className={`flex flex-col items-center gap-1 py-3 transition-colors ${active === item.id ? 'text-white' : 'text-white/30'}`}>
            <item.icon size={20} />
            <span className="text-[9px] uppercase tracking-wide">{item.label}</span>
          </div>
        </Link>
      ))}
      <button onClick={signOut} className="flex-1">
        <div className="flex flex-col items-center gap-1 py-3 text-white/30 hover:text-white/60 transition-colors">
          <User size={20} />
          <span className="text-[9px] uppercase tracking-wide">Sign out</span>
        </div>
      </button>
    </div>
  )
}
