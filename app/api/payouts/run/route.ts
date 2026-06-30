import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { cycleMonth } = await request.json()
  const { data, error } = await supabase.rpc('run_monthly_payout', { p_cycle_month: cycleMonth })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ count: data })
}
