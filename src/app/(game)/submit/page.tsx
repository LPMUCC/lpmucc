'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Submit() {
  const router = useRouter()
  const [keyNumber, setKeyNumber] = useState('')
  const [keyWord, setKeyWord] = useState('')
  const [chapter, setChapter] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!keyNumber || !keyWord || !chapter || !file) {
      setError('// all fields required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const ext = file.name.split('.').pop()
      const path = `artifacts/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('vault-artifacts').upload(path, file)
      if (uploadError) throw uploadError
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyNumber: parseInt(keyNumber), keyWord: keyWord.toUpperCase().trim(), chapter, artifactPath: path }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess(true)
    } catch (e: any) {
      setError(e.message || '// transmission failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#04342C' }}>
      <div className="font-mono text-center">
        <div className="text-sm mb-4" style={{ color: '#1D9E75' }}>// transmission received</div>
        <div className="text-xs mb-2" style={{ color: '#0F6E56' }}>The Webmaster reviews all submissions personally.</div>
        <div className="text-xs mb-8" style={{ color: '#0F6E56' }}>Do not resubmit.</div>
        <button onClick={() => router.push('/dashboard')}
          className="text-xs border px-6 py-2" style={{ borderColor: '#0F6E56', color: '#0F6E56' }}>
          // return to dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#04342C' }}>
      <div className="w-full max-w-lg font-mono">
        <div className="text-xs tracking-widest mb-8" style={{ color: '#0F6E56' }}>// SUBMIT A VAULT KEY</div>
        {[
          { label: '// WHICH KEY ARE YOU SUBMITTING? (1-33)', value: keyNumber, set: setKeyNumber, type: 'number' },
          { label: '// ENTER THE KEY WORD', value: keyWord, set: (v:string)=>setKeyWord(v.toUpperCase()), type: 'text' },
          { label: '// WHICH CHAPTER CONTAINS THIS KEY?', value: chapter, set: setChapter, type: 'text' },
        ].map(({ label, value, set, type }) => (
          <div key={label} className="mb-6">
            <div className="text-xs mb-2" style={{ color: '#0F6E56' }}>{label}</div>
            <input type={type} value={value} onChange={e => set(e.target.value)}
              className="w-full bg-transparent border-b outline-none py-2 text-sm"
              style={{ borderColor: '#0F6E56', color: '#9FE1CB' }} autoComplete="off" spellCheck={false} />
          </div>
        ))}
        <div className="mb-8">
          <div className="text-xs mb-2" style={{ color: '#0F6E56' }}>// UPLOAD YOUR PROOF ARTIFACT</div>
          <div className="text-xs mb-3" style={{ color: '#085041' }}>The artifact must demonstrate that you did the work. Not that you read it. That you did it.</div>
          <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}
            className="text-xs w-full" style={{ color: '#9FE1CB' }} />
          {file && <div className="mt-1 text-xs" style={{ color: '#1D9E75' }}>// {file.name}</div>}
        </div>
        {error && <div className="mb-4 text-xs" style={{ color: '#E24B4A' }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-3 text-sm tracking-widest border"
          style={{ borderColor: '#BA7517', color: '#BA7517', background: 'transparent' }}>
          {loading ? '// transmitting...' : '// TRANSMIT \u2197'}
        </button>
      </div>
    </div>
  )
}
