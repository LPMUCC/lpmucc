'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export default function Registry() {
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    supabase.from('registry').select('*')
      .eq('approved', true)
      .order('completion_year', { ascending: false })
      .then(({ data }) => { if (data) setEntries(data) })
  }, [])

  return (
    <div style={{ background:'#04342C', minHeight:'100vh', fontFamily:'Courier New, monospace' }}>
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'64px 32px' }}>
        <div style={{ color:'#BA7517', fontSize:'11px', letterSpacing:'0.15em', marginBottom:'8px' }}>// PRIVATE BANKER REGISTRY</div>
        <div style={{ color:'#0F6E56', fontSize:'11px', marginBottom:'32px' }}>// VERIFIED COMPLETE STRUCTURES</div>
        <div style={{ borderTop:'1px solid #0F6E56', marginBottom:'32px' }} />
        {entries.length === 0 ? (
          <div style={{ color:'#0F6E56', fontSize:'11px', lineHeight:'2' }}>
            <div>// NO ENTRIES ON RECORD</div>
            <div>// THE VAULT HAS NOT YET BEEN CLAIMED</div>
            <div>// ANNUAL HUNT: OPENS JANUARY 1 · CLOSES DECEMBER 31</div>
            <div style={{ marginTop:'16px' }}>
              <a href="https://lawlipodcast.com/books" style={{ color:'#BA7517', textDecoration:'none' }}>lawlipodcast.com/books</a>
              {' · '}
              <a href="https://lpmucc.com" style={{ color:'#BA7517', textDecoration:'none' }}>lpmucc.com</a>
            </div>
          </div>
        ) : entries.map(e => (
          <div key={e.id} style={{ marginBottom:'24px', paddingBottom:'24px', borderBottom:'1px solid #0F6E56' }}>
            <div style={{ color:'#9FE1CB', fontSize:'12px' }}>{e.public_name} · {e.completion_year} · {e.prize_tier}</div>
            <div style={{ color:'#0F6E56', fontSize:'11px', marginTop:'4px' }}>"{e.public_statement}"</div>
          </div>
        ))}
      </div>
    </div>
  )
}
