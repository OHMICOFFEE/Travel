import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Dashboard from '@/components/Dashboard'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('*, membership_tiers(*), ranks(*)')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/register')

  const { data: kyc } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('member_id', member.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  const { data: nextRank } = member.current_rank_id
    ? await supabase.from('ranks').select('*').gt('sort_order', member.ranks?.sort_order ?? 0).order('sort_order').limit(1).single()
    : await supabase.from('ranks').select('*').eq('sort_order', 1).single()

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, ranks(name)')
    .eq('member_id', member.id)
    .order('cycle_month', { ascending: false })

  const { data: destinations } = await supabase.from('destinations').select('*').order('featured', { ascending: false })

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, destinations(name, location)')
    .eq('member_id', member.id)
    .order('created_at', { ascending: false })

  const { data: downline } = await supabase
    .from('members')
    .select('id, first_name, last_name, email, status, parent_id, leg, left_child_id, right_child_id, current_rank_id, membership_tiers(name), ranks(name)')

  const { data: ohmiTxns } = await supabase
    .from('ohmi_transactions')
    .select('*')
    .eq('member_id', member.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <Dashboard
      member={member}
      kyc={kyc ?? null}
      nextRank={nextRank}
      payouts={payouts ?? []}
      destinations={destinations ?? []}
      purchases={purchases ?? []}
      downline={downline ?? []}
      ohmiTxns={ohmiTxns ?? []}
    />
  )
}
