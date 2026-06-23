'use client'
export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function ActivateForm() {
  const router = useRouter()
  const params = useSearchParams()
  const bookNum = parseInt(params.get('book') || '1')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

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
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 5) {
          setLocked(true)
          setError('// the webmaster has been notified of repeated invalid access attempts')
        } else {
          setError(data.message || '// code not recognized')
        }
      } else {
        if (data.satelliteRedirect) {
          router.push(data.satelliteSlug)
        } else {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('// transmission error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: '#04342C' }}>
      <div className="w-full max-w-md font-mono">
        <div className="text-xs tracking-widest mb-2" style={{ color: '#0F6E56' }}>
          // BOOK {bookNum} ACCESS CODE
        </div>
        <div className="text-xs mb-8" style={{ color: '#0F6E56' }}>
          // enter the 16-character code from inside the front cover of your physical book
        </div>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
          maxLength={16}
          placeholder="________________"
          disabled={locked}
          className="w-full bg-transparent border-b outline-none py-3 text-center text-xl tracking-widest mb-6"
          style={{ borderColor: '#1D9E75', color: '#9FE1CB', letterSpacing: '0.4em' }}
          autoComplete="off"
          spellCheck={false}
        />
        {error && (
          <div className="mb-4 text-xs" style={{ color: '#E24B4A' }}>{error}</div>
        )}
        <button
          onClick={handleActivate}
          disabled={loading || locked || code.length < 16}
          className="w-full py-3 text-sm tracking-widest border transition-all"
          style={{
            borderColor: '#BA7517', color: '#BA7517', background: 'transparent',
            opacity: code.length < 16 ? 0.4 : 1
          }}>
          {loading ? '// validating...' : '// TRANSMIT \u2197'}
        </button>
        <div className="mt-8 text-xs text-center" style={{ color: '#0F6E56' }}>
          <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517' }}>lawlipodcast.com/books</a>
          {' \u00b7 '}
          <a href="https://lpmucc.com" style={{ color: '#BA7517' }}>lpmucc.com</a>
        </div>
      </div>
    </div>
  )
}

export default function Activate() {
  return (
    <Suspense>
      <ActivateForm />
    </Suspense>
  )
}
