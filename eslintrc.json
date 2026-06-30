'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl italic text-center mb-8" style={{ fontFamily: 'Georgia, serif' }}>OHMI Travel</h1>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/40" />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-white/40 mt-6">
          No account? <Link href="/register" className="text-white underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
