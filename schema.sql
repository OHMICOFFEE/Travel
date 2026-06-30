'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [sponsorEmail, setSponsorEmail] = useState('')
  const [leg, setLeg] = useState<'left' | 'right'>('left')
  const [tier, setTier] = useState<'Explorer' | 'Bespoke'>('Explorer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !authData.user) { setError(authError?.message || 'Signup failed'); setLoading(false); return }

    let sponsorId = null
    let parentId = null
    if (sponsorEmail) {
      const { data: sponsor } = await supabase.from('members').select('id').eq('email', sponsorEmail).single()
      if (sponsor) { sponsorId = sponsor.id; parentId = sponsor.id }
      else { setError('Sponsor email not found'); setLoading(false); return }
    }

    const { data: tierRow } = await supabase.from('membership_tiers').select('id').eq('name', tier).single()

    const { error: memberError } = await supabase.from('members').insert({
      user_id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      tier_id: tierRow?.id,
      sponsor_id: sponsorId,
      parent_id: parentId,
      leg: parentId ? leg : null,
      status: 'active',
    })

    if (memberError) { setError(memberError.message); setLoading(false); return }

    if (parentId) {
      const field = leg === 'left' ? 'left_child_id' : 'right_child_id'
      const { data: newMember } = await supabase.from('members').select('id').eq('user_id', authData.user.id).single()
      await supabase.from('members').update({ [field]: newMember?.id }).eq('id', parentId)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl italic text-center mb-8" style={{ fontFamily: 'Georgia, serif' }}>Join OHMI Travel</h1>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required
              className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
            <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required
              className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
          </div>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
          <input placeholder="Sponsor email (optional)" value={sponsorEmail} onChange={e => setSponsorEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40 placeholder-white/30" />

          {sponsorEmail && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setLeg('left')}
                className={`py-3 rounded-lg text-sm border ${leg === 'left' ? 'border-green-400/50 bg-green-400/10 text-green-400' : 'border-white/10 text-white/40'}`}>Left leg</button>
              <button type="button" onClick={() => setLeg('right')}
                className={`py-3 rounded-lg text-sm border ${leg === 'right' ? 'border-blue-400/50 bg-blue-400/10 text-blue-400' : 'border-white/10 text-white/40'}`}>Right leg</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setTier('Explorer')}
              className={`py-3 rounded-lg text-sm border ${tier === 'Explorer' ? 'border-green-400/50 bg-green-400/10 text-green-400' : 'border-white/10 text-white/40'}`}>Explorer<br /><span className="text-[10px]">R1,499/mo</span></button>
            <button type="button" onClick={() => setTier('Bespoke')}
              className={`py-3 rounded-lg text-sm border ${tier === 'Bespoke' ? 'border-blue-400/50 bg-blue-400/10 text-blue-400' : 'border-white/10 text-white/40'}`}>Bespoke<br /><span className="text-[10px]">R2,499/mo</span></button>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account? <Link href="/login" className="text-white underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
