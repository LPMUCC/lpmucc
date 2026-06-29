'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

const LINES = [
  { text: '// SESSION INITIALIZED', color: '#9FE1CB' },
  { text: '// NODE: lpmucc.com', color: '#9FE1CB' },
  { text: '// CLEARANCE: INSUFFICIENT', color: '#E24B4A' },
  { text: '', color: 'transparent' },
  { text: 'The board was set before you arrived.', color: '#FFFFFF' },
  { text: 'The rules were written before you were born.', color: '#FFFFFF' },
  { text: 'The banker does not land on squares that cost them.', color: '#FFFFFF' },
  { text: 'The vault does not open for the uninitiated.', color: '#FFFFFF' },
]

const RESPONSES = [
  '// transmission not recognized',
  '// the webmaster has noted your attempt',
  '// study the first chapter again',
  '// wrong universe',
  '// the board was never yours. yet.',
]

const mono = 'Courier New, monospace'

export default function Home() {
  const router = useRouter()
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [showCounters, setShowCounters] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [response, setResponse] = useState('')
  const [datetime, setDatetime] = useState('')
  const [keys, setKeys] = useState(0)
  const [days, setDays] = useState(1)
  const [structures, setStructures] = useState(0)
  const [hunters, setHunters] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setDatetime(new Date().toUTCString()), 1000)
    setDatetime(new Date().toUTCString())
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    LINES.forEach((_, i) => {
      setTimeout(() => setVisibleLines(prev => [...prev, i]), i * 600)
    })
    setTimeout(() => setShowCounters(true), 5200)
    setTimeout(() => setShowInput(true), 8000)
  }, [])

  useEffect(() => {
    // Check session - redirect to dashboard if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
    // Fetch stats once
    supabase.from('platform_stats').select('*').then(({ data }) => {
      if (!data) return
      data.forEach((r: any) => {
        if (r.stat_key === 'keys_found_globally') setKeys(r.stat_value)
        if (r.stat_key === 'days_since_launch') setDays(r.stat_value)
        if (r.stat_key === 'structures_submitted_current_year') setStructures(r.stat_value)
        if (r.stat_key === 'hunters_active') setHunters(r.stat_value)
      })
    })
  }, [router])

  const handleInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const val = inputValue.trim().toUpperCase()
    if (val === 'ENTER') {
      router.push('/login?mode=register')
      setInputValue('')
    } else {
      setResponse(RESPONSES[Math.floor(Math.random() * RESPONSES.length)])
      setInputValue('')
      setTimeout(() => setResponse(''), 3000)
    }
  }, [inputValue, router])

  return (
    <div style={{ minHeight: '100vh', background: '#04342C', display: 'flex', flexDirection: 'column', fontFamily: mono }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #0F6E56' }}>
        <span style={{ color: '#0F6E56', fontSize: '12px', letterSpacing: '0.1em' }}>LPMUCC // VAULT TERMINAL</span>
        <span style={{ color: '#0F6E56', fontSize: '12px' }}>{datetime}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <div style={{ width: '100%', marginBottom: '48px' }}>
          {LINES.map((line, i) => (
            <div key={i} style={{ color: line.color, fontSize: '14px', lineHeight: '1.8', minHeight: '1.6rem', opacity: visibleLines.includes(i) ? 1 : 0, transition: 'opacity 0.3s' }}>
              {i === 7 ? (
                <>
                  {line.text.slice(0, -1)}
                  <span onClick={() => router.push('/login')} style={{ cursor: 'default' }}>.</span>
                </>
              ) : line.text}
            </div>
          ))}
        </div>

        {showCounters && (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {[
              { val: keys, label: '[KEYS FOUND]' },
              { val: days, label: '[DAYS ACTIVE]' },
              { val: structures, label: '[STRUCTURES SUBMITTED]' },
              { val: hunters, label: '[HUNTERS ACTIVE]' },
            ].map(({ val, label }) => (
              <div key={label} style={{ borderTop: '1px solid #0F6E56', paddingTop: '16px' }}>
                <div style={{ color: '#BA7517', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{String(val).padStart(4, '0')}</div>
                <div style={{ color: '#0F6E56', fontSize: '10px', letterSpacing: '0.15em', opacity: 0.3 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {showInput && (
          <div style={{ width: '100%' }}>
            <input type="text" value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleInput}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(15,110,86,0.08)', outline: 'none', color: '#9FE1CB', fontFamily: mono, fontSize: '13px', padding: '4px 8px', opacity: 0.12, boxSizing: 'border-box' }}
              autoComplete="off" spellCheck={false} aria-label="terminal" />
            {response && <div style={{ marginTop: '8px', fontSize: '12px', color: '#0F6E56' }}>{response}</div>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', borderTop: '1px solid #0F6E56', fontSize: '11px', color: '#0F6E56' }}>
        <span>K. LAWLI · LAWLI PUBLISHING · 2026</span>
        <span>
          <a href="https://lpmucc.com" style={{ color: '#BA7517', textDecoration: 'none' }}>lpmucc.com</a>
          {' · '}
          <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517', textDecoration: 'none' }}>lawlipodcast.com/books</a>
        </span>
      </div>
    </div>
  )
}
