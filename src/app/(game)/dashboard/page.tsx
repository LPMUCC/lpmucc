'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'


const VAULT_KEYS: Record<number,string> = {
  1:'ENTER',2:'BANKER',3:'CONVERT',4:'SMART',5:'SHIELD',6:'LEDGER',7:'QUESTION',8:'NOTICE',9:'LEGACY',
  10:'VOLUNTARY',11:'SOURCE',12:'WITHDRAW',13:'TENDER',14:'REBUT',15:'CORRECT',16:'BURDEN',17:'RECORD',18:'OFFICE',19:'ISSUE',20:'INSTRUMENT',21:'NETWORK',
  22:'DYNASTY',23:'ROCKEFELLER',24:'PATENT',25:'ALLODIAL',26:'TRUST',27:'PROTECTOR',28:'CENTURY',29:'BANKER',30:'PROBATE',31:'PRIVATE',32:'TEACH',33:'LEGACY'
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [keysVerified, setKeysVerified] = useState<number[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accountAgeDays, setAccountAgeDays] = useState(0)

  

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data: prof } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setKeysVerified(prof.keys_verified || [])
        setAccountAgeDays(Math.floor((Date.now() - new Date(prof.account_created_at).getTime()) / 86400000))
      }
      const { data: subs } = await supabase.from('vault_submissions').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false })
      if (subs) setSubmissions(subs)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div style={{ background: '#04342C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Courier New, monospace', color: '#0F6E56' }}>// loading</div>

  const groups = [
    { start:1, end:9, book:1, unlocked:!!profile?.book_1_activated_at, acc:'#1D9E75', label:'BOOK ONE' },
    { start:10, end:21, book:2, unlocked:!!profile?.book_2_activated_at, acc:'#EF9F27', label:'BOOK TWO' },
    { start:22, end:33, book:3, unlocked:!!profile?.book_3_activated_at, acc:'#7F77DD', label:'BOOK THREE' },
  ]

  return (
    <div style={{ background: '#04342C', minHeight: '100vh', fontFamily: 'Courier New, monospace' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #0F6E56' }}>
        <span style={{ color:'#0F6E56', fontSize:'12px' }}>LPMUCC // VAULT TERMINAL</span>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} style={{ background:'transparent', border:'none', color:'#0F6E56', fontFamily:'Courier New, monospace', fontSize:'11px', cursor:'pointer' }}>// sign out</button>
      </div>
      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'48px 32px' }}>
        <div style={{ color:'#0F6E56', fontSize:'11px', marginBottom:'32px' }}>
          <div style={{ marginBottom:'4px' }}>// <span style={{ color:'#9FE1CB' }}>{profile?.username}</span> · <span style={{ color:'#BA7517' }}>{profile?.tier?.toUpperCase()}</span> · DAY {accountAgeDays}</div>
          <div>KEYS: {keysVerified.length}/33 · BOOKS: {[profile?.book_1_activated_at, profile?.book_2_activated_at, profile?.book_3_activated_at].filter(Boolean).length}/3</div>
        </div>

        {groups.map(g => (
          <div key={g.book} style={{ marginBottom:'32px' }}>
            <div style={{ color:g.acc, fontSize:'10px', letterSpacing:'0.15em', opacity:0.6, marginBottom:'12px' }}>// {g.label}</div>
            {!g.unlocked ? (
              <div style={{ border:`1px solid ${g.acc}22`, color:'#0F6E56', fontSize:'11px', padding:'16px', textAlign:'center' }}>
                ██████ BOOK {g.book} NOT YET UNLOCKED ██████
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                {Array.from({ length: g.end - g.start + 1 }, (_, i) => {
                  const kn = g.start + i
                  const verified = keysVerified.includes(kn)
                  const pending = submissions.find(s => s.key_number === kn && s.review_status === 'pending')
                  return (
                    <div key={kn} style={{ border:`1px solid ${verified ? g.acc : g.acc+'33'}`, background: verified ? g.acc+'11' : 'transparent', padding:'12px', fontSize:'11px' }}>
                      <div style={{ color: verified ? g.acc : '#333', marginBottom:'4px' }}>{String(kn).padStart(2,'0')}</div>
                      {verified ? <><div style={{ color:'#FFF', fontWeight:'bold' }}>{VAULT_KEYS[kn]}</div><div style={{ color:'#0F6E56', fontSize:'10px' }}>✓ verified</div></>
                        : pending ? <div style={{ color:'#BA7517' }}>// pending</div>
                        : <div style={{ color:'#222' }}>_ _ _ _ _</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop:'32px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <button onClick={() => router.push('/submit')} style={{ background:'transparent', border:'1px solid #1D9E75', color:'#1D9E75', fontFamily:'Courier New, monospace', fontSize:'13px', padding:'12px 16px', cursor:'pointer', textAlign:'left' }}>// SUBMIT A KEY →</button>
          {keysVerified.length >= 9 && !profile?.book_2_activated_at && (
            <button onClick={() => router.push('/activate?book=2')} style={{ background:'transparent', border:'1px solid #EF9F27', color:'#EF9F27', fontFamily:'Courier New, monospace', fontSize:'13px', padding:'12px 16px', cursor:'pointer', textAlign:'left' }}>// ACTIVATE BOOK TWO →</button>
          )}
          {keysVerified.length >= 21 && !profile?.book_3_activated_at && (
            <button onClick={() => router.push('/activate?book=3')} style={{ background:'transparent', border:'1px solid #7F77DD', color:'#7F77DD', fontFamily:'Courier New, monospace', fontSize:'13px', padding:'12px 16px', cursor:'pointer', textAlign:'left' }}>// ACTIVATE BOOK THREE →</button>
          )}
          {keysVerified.length === 33 && (
            <button onClick={() => router.push('/vault')} style={{ background:'transparent', border:'1px solid #BA7517', color:'#BA7517', fontFamily:'Courier New, monospace', fontSize:'13px', padding:'12px 16px', cursor:'pointer', textAlign:'left' }}>// THE VAULT →</button>
          )}
        </div>

        <div style={{ marginTop:'64px', paddingTop:'32px', borderTop:'1px solid #0F6E56', display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#0F6E56' }}>
          <span>K. LAWLI · LAWLI PUBLISHING · 2026</span>
          <span><a href="https://lpmucc.com" style={{ color:'#BA7517', textDecoration:'none' }}>lpmucc.com</a> · <a href="https://lawlipodcast.com/books" style={{ color:'#BA7517', textDecoration:'none' }}>lawlipodcast.com/books</a></span>
        </div>
      </div>
    </div>
  )
}
