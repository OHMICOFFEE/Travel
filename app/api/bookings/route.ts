import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { destination_id, guests, booking_date, notes } = body

  if (!destination_id || !guests || !booking_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch destination price
  const { data: destination, error: destError } = await supabase
    .from('destinations')
    .select('price')
    .eq('id', destination_id)
    .single()

  if (destError || !destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
  }

  const total_price = destination.price * guests

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      destination_id,
      guests,
      booking_date,
      total_price,
      status: 'pending',
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking }, { status: 201 })
}

export async function GET() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`*, destinations(name, location, duration)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings })
}
