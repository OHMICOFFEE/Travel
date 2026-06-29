import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DestinationSwiper from '@/components/DestinationSwiper'

export default async function DestinationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .order('featured', { ascending: false })

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('destination_id')
    .eq('user_id', user.id)

  const wishlistIds = new Set(wishlist?.map((w: any) => w.destination_id) ?? [])

  return <DestinationSwiper destinations={destinations ?? []} wishlistIds={wishlistIds} userId={user.id} />
}
