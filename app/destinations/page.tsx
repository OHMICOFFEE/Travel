import DestinationSwiper from '@/components/DestinationSwiper'
import { createClient } from '@/lib/supabase/server'

export default async function DestinationsPage() {
  const supabase = createClient()

  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .order('featured', { ascending: false })

  return (
    <DestinationSwiper
      destinations={destinations ?? []}
      wishlistIds={new Set()}
      userId={null}
    />
  )
}
