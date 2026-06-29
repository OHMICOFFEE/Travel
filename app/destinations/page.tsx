import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DestinationSwiper from '@/components/DestinationSwiper'

export default async function DestinationsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching destinations:', error)
  }

  // Get user's wishlist
  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('destination_id')
    .eq('user_id', user.id)

  const wishlistIds = new Set(wishlist?.map(w => w.destination_id) ?? [])

  return (
    <DestinationSwiper
      destinations={destinations ?? []}
      wishlistIds={wishlistIds}
      userId={user.id}
    />
  )
}
