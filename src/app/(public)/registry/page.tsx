'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Registry() {
  const [entries, setEntries] = useState<any[]>([])
  useEffect(() => {
    supabase.from('registry').select('*')
      .eq('approved', true).order('completion_year', { ascending: false })
      .then(({ data }) => { if (data) setEntries(data) })
  }, [])
  return (
    <div className="min-h-screen" style={{ background: '#04342C' }}>
      <div className="max-w-2xl mx-auto px-8 py-16 font-mono">
        <div className="text-xs tracking-widest mb-2" style={{ color: '#BA7517' }}>
          // PRIVATE BANKER REGISTRY
        </div>
        <div className="text-xs mb-8" style={{ color: '#0F6E56' }}>
          // VERIFIED COMPLETE STRUCTURES
        </div>
        <div className="border-t mb-8" style={{ borderColor: '#0F6E56' }} />
        {entries.length === 0 ? (
          <div className="space-y-2 text-xs" style={{ color: '#0F6E56' }}>
            <div>// NO ENTRIES ON RECORD</div>
            <div>// THE VAULT HAS NOT YET BEEN CLAIMED</div>
            <div>// ANNUAL HUNT: OPENS JANUARY 1 · CLOSES DECEMBER 31</div>
            <div className="mt-4">
              <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517' }}>lawlipodcast.com/books</a>
              {' · '}
              <a href="https://lpmucc.com" style={{ color: '#BA7517' }}>lpmucc.com</a>
            </div>
          </div>
        ) : (
          entries.map(e => (
            <div key={e.id} className="mb-6 pb-6 border-b text-xs"
              style={{ borderColor: '#0F6E56' }}>
              <div style={{ color: '#9FE1CB' }}>{e.public_name} · {e.completion_year} · {e.prize_tier}</div>
              <div className="mt-1" style={{ color: '#0F6E56' }}>"{e.public_statement}"</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
