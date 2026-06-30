import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { memberId, destinationId } = await request.json()
  const { data, error } = await supabase.rpc('buy_trip', { p_member_id: memberId, p_destination_id: destinationId })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ purchaseId: data }, { status: 201 })
}
