'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CRYPTIC_RESPONSES } from '@/lib/constants'

const LINES = [
  { text: '// SESSION INITIALIZED', color: '#9FE1CB', delay: 0 },
  { text: '// NODE: lpmucc.com', color: '#9FE1CB', delay: 600 },
  { text: '// CLEARANCE: INSUFFICIENT', color: '#E24B4A', delay: 1200 },
  { text: '', color: '', delay: 1800 },
  { text: 'The board was set before you arrived.', color: '#FFFFFF', delay: 2400 },
  { text: 'The rules were written before you were born.', color: '#FFFFFF', delay: 3000 },
  { text: 'The banker does not land on squares that cost them.', color: '#FFFFFF', delay: 3600 },
  { text: 'The vault does not open for the uninitiated.', color: '#FFFFFF', delay: 4200, hiddenLogin: true },
]

export default function Home() {
  const router = useRouter()
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [showCounters, setShowCounters] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [response, setResponse] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [stats, setStats] = useState({ keys: 0, days: 1, structures: 0, hunters: 0 })
  const [datetime, setDatetime] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const updateTime = () => {
      setDatetime(new Date().toUTCString().replace('GMT', 'GMT'))
    }
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    LINES.forEach((_, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, LINES[i].delay)
    })
    setTimeout(() => setShowCounters(true), 5000)
    setTimeout(() => setShowInput(true), 8000)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('platform_stats').select('*')
      if (data) {
        const map: Record<string, number> = {}
        data.forEach((r: any) => { map[r.stat_key] = r.stat_value })
        setStats({
          keys: map.keys_found_globally ?? 0,
          days: map.days_since_launch ?? 1,
          structures: map.structures_submitted_current_year ?? 0,
          hunters: map.hunters_active ?? 0,
        })
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleInput = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    const val = inputValue.trim().toUpperCase()
    if (val === 'ENTER') {
      setAuthMode('register')
      setShowAuthModal(true)
      setInputValue('')
    } else {
      const r = CRYPTIC_RESPONSES[Math.floor(Math.random() * CRYPTIC_RESPONSES.length)]
      setResponse(r)
      setInputValue('')
      setTimeout(() => setResponse(''), 3000)
    }
  }, [inputValue])

  const handleAuth = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        })
        if (error) throw error
        router.push('/activate')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (e: any) {
      setAuthError(e.message)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#04342C' }}>
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-vault-teal-dim/30">
        <span className="text-sm tracking-widest" style={{ color: '#0F6E56' }}>LPMUCC // VAULT TERMINAL</span>
        <span className="text-sm" style={{ color: '#0F6E56' }}>{datetime}</span>
      </div>

      {/* Main terminal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-1 mb-12">
          {LINES.map((line, i) => (
            <div
              key={i}
              className={`font-mono text-sm leading-relaxed transition-opacity duration-300 ${
                visibleLines.includes(i) ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ color: line.color || 'transparent', minHeight: '1.5rem' }}
            >
              {line.hiddenLogin ? (
                <span>
                  {line.text.slice(0, -1)}
                  <span
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                    style={{ cursor: 'default' }}
                  >.</span>
                </span>
              ) : line.text}
            </div>
          ))}
        </div>

        {/* Counters */}
        {showCounters && (
          <div className="w-full grid grid-cols-2 gap-6 mb-8">
            {[
              { val: stats.keys, label: '[KEYS FOUND]' },
              { val: stats.days, label: '[DAYS ACTIVE]' },
              { val: stats.structures, label: '[STRUCTURES SUBMITTED]' },
              { val: stats.hunters, label: '[HUNTERS ACTIVE]' },
            ].map(({ val, label }) => (
              <div key={label} className="border-t pt-4 group" style={{ borderColor: '#0F6E56' }}>
                <div className="text-3xl font-mono font-bold mb-1" style={{ color: '#BA7517' }}>
                  {String(val).padStart(4, '0')}
                </div>
                <div
                  className="text-xs tracking-widest transition-opacity duration-300 opacity-20 group-hover:opacity-70"
                  style={{ color: '#0F6E56' }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden ENTER input */}
        {showInput && (
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleInput}
              className="w-full bg-transparent outline-none font-mono text-sm caret-vault-teal"
              style={{
                color: '#9FE1CB',
                border: '1px solid rgba(15,110,86,0.08)',
                padding: '4px 8px',
                opacity: 0.15,
              }}
              autoComplete="off"
              spellCheck={false}
              aria-label="terminal input"
            />
            {response && (
              <div className="mt-2 text-xs font-mono" style={{ color: '#0F6E56' }}>
                {response}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-8 py-4 border-t text-xs font-mono"
        style={{ borderColor: '#0F6E56', color: '#0F6E56' }}>
        <span>K. LAWLI · LAWLI PUBLISHING · 2026</span>
        <span>
          <a href="https://lpmucc.com" style={{ color: '#BA7517' }} className="hover:underline">lpmucc.com</a>
          {' · '}
          <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517' }} className="hover:underline">lawlipodcast.com/books</a>
        </span>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={e => e.target === e.currentTarget && setShowAuthModal(false)}>
          <div className="w-full max-w-md p-8 font-mono border"
            style={{ background: '#04342C', borderColor: '#1D9E75' }}>
            <div className="text-xs tracking-widest mb-6" style={{ color: '#0F6E56' }}>
              {authMode === 'register' ? '// CREATE ACCESS POINT' : '// RETURNING OPERATOR'}
            </div>
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-transparent border-b outline-none py-2 mb-4 text-sm"
                style={{ borderColor: '#0F6E56', color: '#9FE1CB' }}
              />
            )}
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b outline-none py-2 mb-4 text-sm"
              style={{ borderColor: '#0F6E56', color: '#9FE1CB' }}
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full bg-transparent border-b outline-none py-2 mb-6 text-sm"
              style={{ borderColor: '#0F6E56', color: '#9FE1CB' }}
            />
            {authError && (
              <div className="mb-4 text-xs" style={{ color: '#E24B4A' }}>{authError}</div>
            )}
            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="w-full py-2 text-sm tracking-widest border transition-all"
              style={{ borderColor: '#BA7517', color: '#BA7517', background: 'transparent' }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = '#BA7517'
                ;(e.target as HTMLElement).style.color = '#04342C'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'transparent'
                ;(e.target as HTMLElement).style.color = '#BA7517'
              }}
            >
              {authLoading ? '// TRANSMITTING...' : authMode === 'register' ? '// ESTABLISH ACCESS POINT' : '// AUTHENTICATE'}
            </button>
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="w-full mt-3 text-xs text-center"
              style={{ color: '#0F6E56' }}
            >
              {authMode === 'login' ? 'create access point →' : 'returning operator →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
