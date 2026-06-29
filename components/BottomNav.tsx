'use client'

import Link from 'next/link'
import { Compass, Heart, Calendar, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  active: 'explore' | 'saved' | 'bookings' | 'profile'
}

export default function BottomNav({ active }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const items = [
    { id: 'explore', icon: Compass, label: 'Explore', href: '/destinations' },
    { id: 'saved', icon: Heart, label: 'Saved', href: '/destinations?filter=saved' },
    { id: 'bookings', icon: Calendar, label: 'Bookings', href: '/bookings' },
    { id: 'profile', icon: User, label: 'Profile', onClick: signOut },
  ] as const

  return (
    <div className="flex bg-[#0d1b2a] border-t border-white/8 pb-safe">
      {items.map(item => {
        const isActive = active === item.id
        const Icon = item.icon
        const content = (
          <div
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              isActive ? 'text-white' : 'text-white/30 hover:text-white/55'
            }`}
          >
            <Icon size={20} />
            <span className="text-[9px] tracking-wide uppercase">{item.label}</span>
          </div>
        )

        if ('onClick' in item && item.onClick) {
          return (
            <button key={item.id} onClick={item.onClick} className="flex-1">
              {content}
            </button>
          )
        }

        return (
          <Link key={item.id} href={item.href} className="flex-1">
            {content}
          </Link>
        )
      })}
    </div>
  )
}
