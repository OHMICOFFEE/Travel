'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Hexagon, Star, MapPin, Check } from 'lucide-react'

const TABS = ['Overview', 'Tree', 'Payouts', 'OHMI', 'Trips', 'KYC']

export default function Dashboard({ member, kyc, nextRank, payouts, destinations, purchases, downline, ohmiTxns }: any) {
  const [tab, setTab] = useState('Overview')
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const rank = member.ranks
  const tier = member.membership_tiers

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#0a0a0a] border-b border-white/6 px-5 py-3 flex items-center justify-between">
        <h1 className="text-lg italic" style={{ fontFamily: 'Georgia, serif' }}>OHMI Travel</h1>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] uppercase tracking-widest border px-3 py-1 ${tier?.name === 'Bespoke' ? 'border-blue-400/30 text-blue-400' : 'border-green-400/30 text-green-400'}`}>{tier?.name}</span>
          <button onClick={signOut} className="text-white/30 hover:text-white/60"><LogOut size={16} /></button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border-b border-white/6 px-5 flex gap-0 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-xs whitespace-nowrap border-b-2 ${tab === t ? 'text-white border-blue-400' : 'text-white/35 border-transparent'}`}>{t}</button>
        ))}
      </div>

      <div className="flex-1 p-5 max-w-4xl mx-auto w-full">
        {tab === 'Overview' && <OverviewTab member={member} rank={rank} nextRank={nextRank} kyc={kyc} payouts={payouts} />}
        {tab === 'Tree' && <TreeTab member={member} downline={downline} />}
        {tab === 'Payouts' && <PayoutsTab payouts={payouts} />}
        {tab === 'OHMI' && <OhmiTab member={member} ohmiTxns={ohmiTxns} />}
        {tab === 'Trips' && <TripsTab member={member} tier={tier} destinations={destinations} purchases={purchases} />}
        {tab === 'KYC' && <KycTab member={member} kyc={kyc} />}
      </div>
    </div>
  )
}

function OverviewTab({ member, rank, nextRank, kyc, payouts }: any) {
  const latestPayout = payouts[0]
  const leftPct = nextRank ? Math.min(100, (member.left_leg_count / nextRank.left_required) * 100) : 100
  const rightPct = nextRank ? Math.min(100, (member.right_leg_count / nextRank.right_required) * 100) : 100

  return (
    <div>
      {kyc?.status !== 'approved' && (
        <div className="mb-5 bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
          <p className="text-sm text-amber-400 font-medium">{kyc?.status === 'pending' ? 'KYC pending review' : 'Complete your identity verification'}</p>
          <p className="text-xs text-white/40 mt-1">Required before you can receive payouts.</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        <Stat label="This month" value={latestPayout ? `R${latestPayout.total_rand.toLocaleString()}` : 'R0'} sub={rank?.name ?? 'Unranked'} color="green" />
        <Stat label="OHMI balance" value={member.ohmi_balance.toLocaleString()} sub={`≈ R${(member.ohmi_balance * 0.1).toFixed(0)}`} color="blue" />
        <Stat label="Network" value={(member.left_leg_count + member.right_leg_count).toString()} sub={`${member.left_leg_count}L · ${member.right_leg_count}R`} />
        <Stat label="Next rank" value={nextRank?.name ?? 'Max'} sub={nextRank ? `R${nextRank.monthly_income.toLocaleString()}/mo` : ''} color="gold" />
      </div>
      <div className="bg-[#0f0f0f] border border-white/6 rounded-lg p-5">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl italic" style={{ fontFamily: 'Georgia, serif' }}>{rank?.name ?? 'Unranked'}</h2>
          </div>
          <p className="text-2xl font-light text-green-400">R{((rank?.monthly_income ?? 0) + (rank?.discretionary_bonus ?? 0)).toLocaleString()}</p>
        </div>
        {nextRank && (
          <>
            <ProgressBar label={`Left — ${member.left_leg_count} / ${nextRank.left_required}`} pct={leftPct} />
            <ProgressBar label={`Right — ${member.right_leg_count} / ${nextRank.right_required}`} pct={rightPct} />
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, sub, color }: any) {
  const c = color === 'green' ? 'text-green-400' : color === 'blue' ? 'text-blue-400' : color === 'gold' ? 'text-amber-400' : 'text-white'
  return (
    <div className="bg-[#0f0f0f] border border-white/6 rounded-lg p-3.5">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">{label}</p>
      <p className={`text-xl font-light ${c}`}>{value}</p>
      <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
    </div>
  )
}

function ProgressBar({ label, pct }: any) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] text-white/30 mb-1.5"><span>{label}</span><span>{Math.round(pct)}%</span></div>
      <div className="h-1 bg-white/8 rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

function TreeTab({ member, downline }: any) {
  const map = new Map(downline.map((m: any) => [m.id, m]))
  function countBelow(id: string, side: 'left' | 'right'): number {
    const m: any = map.get(id)
    if (!m) return 0
    const childId = side === 'left' ? m.left_child_id : m.right_child_id
    if (!childId) return 0
    return 1 + countAll(childId)
  }
  function countAll(id: string): number {
    const m: any = map.get(id)
    if (!m) return 0
    let c = 0
    if (m.left_child_id) c += 1 + countAll(m.left_child_id)
    if (m.right_child_id) c += 1 + countAll(m.right_child_id)
    return c
  }

  const direct = downline.filter((m: any) => m.parent_id === member.id)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f0f0f] border border-green-400/20 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Left leg</p>
          <p className="text-2xl font-light text-green-400">{countBelow(member.id, 'left')}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-blue-400/20 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Right leg</p>
          <p className="text-2xl font-light text-blue-400">{countBelow(member.id, 'right')}</p>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Direct downline</p>
      <div className="space-y-1.5">
        {direct.length ? direct.map((m: any) => (
          <div key={m.id} className="bg-[#0f0f0f] border border-white/6 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-sm">{m.first_name} {m.last_name}</p>
              <p className="text-[11px] text-white/30">{m.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${m.leg === 'left' ? 'border-green-400/30 text-green-400' : 'border-blue-400/30 text-blue-400'}`}>{m.leg} leg</span>
              <span className="text-xs text-amber-400">{m.ranks?.name ?? '—'}</span>
            </div>
          </div>
        )) : <p className="text-white/30 text-sm text-center py-8">No downline yet. Share your email as a sponsor link to start building.</p>}
      </div>
      <div className="mt-5 bg-[#0f0f0f] border border-white/6 rounded-lg p-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Your sponsor link</p>
        <p className="text-sm text-white/60">Share your email: <strong className="text-white">{member.email}</strong></p>
        <p className="text-[11px] text-white/30 mt-1">New members enter this at registration to join your tree.</p>
      </div>
    </div>
  )
}

function PayoutsTab({ payouts }: any) {
  const lifetime = payouts.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + p.total_rand, 0)
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#0f0f0f] border border-green-400/20 rounded-lg p-3.5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Lifetime earned</p>
          <p className="text-xl font-light text-green-400">R{lifetime.toLocaleString()}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-white/6 rounded-lg p-3.5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Total payouts</p>
          <p className="text-xl font-light">{payouts.length}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {payouts.length ? payouts.map((p: any) => (
          <div key={p.id} className="bg-[#0f0f0f] border border-white/6 rounded-lg p-3.5 flex justify-between items-center">
            <div>
              <p className="text-sm">{new Date(p.cycle_month).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}</p>
              <p className="text-[11px] text-white/30">{p.ranks?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-light">R{p.total_rand.toLocaleString()}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.status === 'paid' ? 'border-green-400/30 text-green-400' : 'border-amber-400/30 text-amber-400'}`}>{p.status}</span>
            </div>
          </div>
        )) : <p className="text-white/30 text-sm text-center py-12">No payouts yet.</p>}
      </div>
    </div>
  )
}

function OhmiTab({ member, ohmiTxns }: any) {
  return (
    <div>
      <div className="bg-[#0f0f0f] border border-blue-400/20 rounded-lg p-5 mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-400/60 mb-1">OHMI balance</p>
          <p className="text-4xl font-light text-blue-400">{member.ohmi_balance.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mt-1">≈ R{(member.ohmi_balance * 0.1).toFixed(0)} value</p>
        </div>
        <Hexagon size={32} className="text-blue-400/30" />
      </div>
      <div className="space-y-1">
        {ohmiTxns.map((t: any) => (
          <div key={t.id} className="bg-[#0f0f0f] border border-white/6 rounded-lg px-3.5 py-2.5 flex justify-between items-center">
            <div>
              <p className="text-xs text-white/50 capitalize">{t.type.replace('_', ' ')}{t.notes ? ` — ${t.notes}` : ''}</p>
              <p className="text-[10px] text-white/20">{new Date(t.created_at).toLocaleDateString('en-ZA')}</p>
            </div>
            <p className={`text-sm font-medium ${t.points > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.points > 0 ? '+' : ''}{t.points.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TripsTab({ member, tier, destinations, purchases }: any) {
  const [view, setView] = useState<'browse' | 'history'>('browse')
  const router = useRouter()
  const discount = tier?.trip_discount_pct ?? 0

  async function book(destId: string) {
    const res = await fetch('/api/trips/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: member.id, destinationId: destId }),
    })
    if (res.ok) { router.refresh() }
  }

  return (
    <div>
      <div className="flex gap-0 border-b border-white/8 mb-4">
        <button onClick={() => setView('browse')} className={`px-4 py-2 text-xs border-b-2 ${view === 'browse' ? 'text-white border-blue-400' : 'text-white/35 border-transparent'}`}>Browse</button>
        <button onClick={() => setView('history')} className={`px-4 py-2 text-xs border-b-2 ${view === 'history' ? 'text-white border-blue-400' : 'text-white/35 border-transparent'}`}>My bookings</button>
      </div>
      {view === 'browse' ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {destinations.map((d: any) => {
            const finalPrice = d.retail_price * (1 - discount / 100)
            return (
              <div key={d.id} className="bg-[#0f0f0f] border border-white/6 rounded-lg overflow-hidden">
                {d.image_url && <img src={d.image_url} alt={d.name} className="w-full h-36 object-cover" />}
                <div className="p-3.5">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-[11px] text-white/35">{d.location} · {d.days}</p>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      {discount > 0 && <p className="text-[10px] text-white/25 line-through">R{d.retail_price.toLocaleString()}</p>}
                      <p className="text-lg font-light">R{finalPrice.toLocaleString()}</p>
                    </div>
                    <button onClick={() => book(d.id)} className="px-4 py-2 bg-white text-black text-[11px] font-medium uppercase rounded">Book</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {purchases.length ? purchases.map((p: any) => (
            <div key={p.id} className="bg-[#0f0f0f] border border-white/6 rounded-lg p-3.5 flex justify-between">
              <div>
                <p className="text-sm">{p.destinations?.name}</p>
                <p className="text-[11px] text-white/35">{new Date(p.created_at).toLocaleDateString('en-ZA')}</p>
              </div>
              <p className="text-sm font-light">R{p.final_price.toLocaleString()}</p>
            </div>
          )) : <p className="text-white/30 text-sm text-center py-12">No bookings yet.</p>}
        </div>
      )}
    </div>
  )
}

function KycTab({ member, kyc }: any) {
  const [fullName, setFullName] = useState(kyc?.full_legal_name ?? `${member.first_name} ${member.last_name}`)
  const [idNumber, setIdNumber] = useState(kyc?.id_number ?? '')
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function submit() {
    await supabase.from('kyc_submissions').insert({
      member_id: member.id,
      full_legal_name: fullName,
      id_number: idNumber,
      status: 'pending',
    })
    setSubmitted(true)
    router.refresh()
  }

  if (kyc?.status === 'approved') {
    return (
      <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-6 text-center">
        <Check size={32} className="text-green-400 mx-auto mb-2" />
        <p className="text-green-400 font-medium">KYC approved</p>
      </div>
    )
  }
  if (kyc?.status === 'pending' || submitted) {
    return (
      <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-6 text-center">
        <p className="text-amber-400 font-medium">Pending review</p>
        <p className="text-xs text-white/40 mt-1">We&apos;ll notify you once approved.</p>
      </div>
    )
  }

  return (
    <div className="max-w-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase">Full legal name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-2 uppercase">ID number</label>
          <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
        </div>
        <button onClick={submit} className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium">Submit for verification</button>
      </div>
    </div>
  )
}
