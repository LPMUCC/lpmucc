'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Suspense } from 'react'

const mono = 'Courier New, monospace'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login'|'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [username, setUsername] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [router])

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { username } }
        })
        if (error) throw error
        router.push('/activate')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid #1D9E75', outline: 'none',
    color: '#9FE1CB', fontFamily: mono, fontSize: '14px',
    padding: '10px 0', marginBottom: '20px', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#04342C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ color: '#0F6E56', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '32px' }}>
          {mode === 'login' ? '// RETURNING OPERATOR' : '// CREATE ACCESS POINT'}
        </div>

        {mode === 'register' && (
          <input type="text" placeholder="username" value={username}
            onChange={e => setUsername(e.target.value)} style={inp} autoComplete="off" />
        )}
        <input type="email" placeholder="email" value={email}
          onChange={e => setEmail(e.target.value)} style={inp} autoComplete="email" />
        <input type="password" placeholder="password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ ...inp, marginBottom: '32px' }} autoComplete="current-password" />

        {error && <div style={{ color: '#E24B4A', fontSize: '11px', marginBottom: '16px' }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', background: 'transparent', border: '1px solid #BA7517',
          color: '#BA7517', fontFamily: mono, fontSize: '13px', padding: '14px',
          cursor: 'pointer', letterSpacing: '0.1em', marginBottom: '16px',
        }}>
          {loading ? '// TRANSMITTING...' : mode === 'login' ? '// AUTHENTICATE' : '// ESTABLISH ACCESS POINT'}
        </button>

        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{
          width: '100%', background: 'transparent', border: 'none',
          color: '#0F6E56', fontFamily: mono, fontSize: '11px', cursor: 'pointer', padding: '8px',
        }}>
          {mode === 'login' ? 'create access point →' : 'returning operator →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '11px' }}>
          <a href="/" style={{ color: '#0F6E56', textDecoration: 'none' }}>← back</a>
          {'  ·  '}
          <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517', textDecoration: 'none' }}>get the books</a>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{ background: '#04342C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Courier New, monospace', color: '#0F6E56' }}>
        // loading
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
