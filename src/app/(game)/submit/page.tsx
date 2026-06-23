'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function Submit() {
  const router = useRouter()
  const [keyNumber, setKeyNumber] = useState('')
  const [keyWord, setKeyWord] = useState('')
  const [chapter, setChapter] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const handleSubmit = async () => {
    if (!keyNumber || !keyWord || !chapter || !file) { setError('// all fields required'); return }
    setLoading(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const path = `artifacts/${user.id}/${Date.now()}.${file.name.split('.').pop()}`
      const { error: ue } = await supabase.storage.from('vault-artifacts').upload(path, file)
      if (ue) throw ue
      const res = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyNumber: parseInt(keyNumber), keyWord: keyWord.toUpperCase().trim(), chapter, artifactPath: path }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess(true)
    } catch (e: any) { setError(e.message || '// transmission failed') }
    finally { setLoading(false) }
  }

  const bg = { fontFamily: 'Courier New, monospace', background: '#04342C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #0F6E56', outline: 'none', color: '#9FE1CB', fontFamily: 'Courier New, monospace', fontSize: '13px', padding: '8px 0', marginBottom: '24px', boxSizing: 'border-box' as const }

  if (success) return (
    <div style={bg}><div style={{ textAlign: 'center' }}>
      <div style={{ color: '#1D9E75', fontSize: '13px', marginBottom: '16px' }}>// transmission received</div>
      <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '8px' }}>The Webmaster reviews all submissions personally.</div>
      <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '32px' }}>Do not resubmit.</div>
      <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: '1px solid #0F6E56', color: '#0F6E56', fontFamily: 'Courier New, monospace', fontSize: '11px', padding: '8px 24px', cursor: 'pointer' }}>// return to dashboard</button>
    </div></div>
  )

  return (
    <div style={bg}><div style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
      <div style={{ color: '#0F6E56', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '32px' }}>// SUBMIT A VAULT KEY</div>
      <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '8px' }}>// WHICH KEY ARE YOU SUBMITTING? (1-33)</div>
      <input type="number" value={keyNumber} onChange={e => setKeyNumber(e.target.value)} min="1" max="33" style={inp} />
      <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '8px' }}>// ENTER THE KEY WORD</div>
      <input type="text" value={keyWord} onChange={e => setKeyWord(e.target.value.toUpperCase())} style={inp} autoComplete="off" spellCheck={false} />
      <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '8px' }}>// WHICH CHAPTER CONTAINS THIS KEY?</div>
      <input type="text" value={chapter} onChange={e => setChapter(e.target.value)} style={inp} autoComplete="off" />
      <div style={{ color: '#0F6E56', fontSize: '11px', marginBottom: '8px' }}>// UPLOAD YOUR PROOF ARTIFACT</div>
      <div style={{ color: '#085041', fontSize: '11px', marginBottom: '12px' }}>The artifact must demonstrate that you did the work. Not that you read it.</div>
      <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ color: '#9FE1CB', fontSize: '11px', marginBottom: '24px' }} />
      {file && <div style={{ color: '#1D9E75', fontSize: '11px', marginBottom: '16px' }}>// {file.name}</div>}
      {error && <div style={{ color: '#E24B4A', fontSize: '11px', marginBottom: '16px' }}>{error}</div>}
      <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: 'transparent', border: '1px solid #BA7517', color: '#BA7517', fontFamily: 'Courier New, monospace', fontSize: '13px', padding: '12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
        {loading ? '// transmitting...' : '// TRANSMIT'}
      </button>
    </div></div>
  )
}
