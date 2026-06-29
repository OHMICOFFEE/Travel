import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { destination_id, guests, booking_date } = await request.json()
  const { data: dest } = await supabase.from('destinations').select('price').eq('id', destination_id).single()
  if (!dest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: booking, error } = await supabase.from('bookings').insert({
    user_id: user.id, destination_id, guests,
    booking_date, total_price: dest.price * guests, status: 'pending'
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ booking }, { status: 201 })
}
