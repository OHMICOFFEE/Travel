import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { destination_id } = await request.json()

  // Check if already wishlisted
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('destination_id', destination_id)
    .single()

  if (existing) {
    // Remove from wishlist
    await supabase.from('wishlists').delete().eq('id', existing.id)
    return NextResponse.json({ wishlisted: false })
  } else {
    // Add to wishlist
    await supabase.from('wishlists').insert({ user_id: user.id, destination_id })
    return NextResponse.json({ wishlisted: true })
  }
}
