'use client'
export const dynamic = 'force-dynamic'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

function ActivateForm() {
  const router = useRouter()
  const params = useSearchParams()
  const bookNum = parseInt(params.get('book') || '1')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    // Give session time to initialize from URL hash or storage
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      } else {
        setChecking(false)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [router])

  const handleActivate = async () => {
    if (locked || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase().trim(), bookNumber: bookNum }),
      })
      const data = await res.json()
      if (!res.ok) {
        const n = attempts + 1
        setAttempts(n)
        if (n >= 5) { setLocked(true); setError('// the webmaster has been notified') }
        else setError(data.message || '// code not recognized')
      } else {
        router.push(data.satelliteRedirect ? data.satelliteSlug : '/dashboard')
      }
    } catch { setError('// transmission error') }
    finally { setLoading(false) }
  }

  if (checking) return (
    <div style={{ fontFamily: 'Courier New, monospace', background: '#04342C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#0F6E56', fontSize: '12px' }}>// verifying session</span>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Courier New, monospace', background: '#04342C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ color: '#0F6E56', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '8px' }}>// BOOK {bookNum} ACCESS CODE</div>
        <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '32px' }}>// enter the 16-character code from your physical book</div>
        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleActivate()} maxLength={16}
          placeholder="________________" disabled={locked}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #1D9E75', outline: 'none', color: '#9FE1CB', fontFamily: 'Courier New, monospace', fontSize: '20px', padding: '12px 0', textAlign: 'center', letterSpacing: '0.4em', marginBottom: '24px', boxSizing: 'border-box' }} />
        {error && <div style={{ color: '#E24B4A', fontSize: '11px', marginBottom: '16px' }}>{error}</div>}
        <button onClick={handleActivate} disabled={loading || locked || code.length < 16}
          style={{ width: '100%', background: 'transparent', border: '1px solid #BA7517', color: '#BA7517', fontFamily: 'Courier New, monospace', fontSize: '13px', padding: '12px', cursor: code.length < 16 ? 'not-allowed' : 'pointer', opacity: code.length < 16 ? 0.4 : 1, letterSpacing: '0.1em' }}>
          {loading ? '// validating...' : '// TRANSMIT'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px' }}>
          <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517', textDecoration: 'none' }}>lawlipodcast.com/books</a>
          {' · '}
          <a href="https://lpmucc.com" style={{ color: '#BA7517', textDecoration: 'none' }}>lpmucc.com</a>
        </div>
      </div>
    </div>
  )
}

export default function Activate() {
  return (
    <Suspense fallback={
      <div style={{ background: '#04342C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Courier New, monospace', color: '#0F6E56' }}>
        // loading
      </div>
    }>
      <ActivateForm />
    </Suspense>
  )
}
