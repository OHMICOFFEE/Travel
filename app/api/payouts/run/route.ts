import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', user.id).eq('is_active', true).single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { cycleMonth } = await request.json()
  const { data, error } = await supabase.rpc('run_monthly_payout', { p_cycle_month: cycleMonth })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ count: data })
}
