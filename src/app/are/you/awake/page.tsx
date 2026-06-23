'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

export default function AreYouAwake() {
  const [visible, setVisible] = useState(false)
  const [input, setInput] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 7000)
    return () => clearTimeout(t)
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return
    await fetch('/api/satellite-contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ node: 'are/you/awake', message: input }) })
    setSent(true)
  }

  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Courier New, monospace' }}>
      {!visible ? (
        <span style={{ color:'#0F6E56', fontSize:'20px', animation:'blink 1s step-end infinite' }}>█</span>
      ) : (
        <div style={{ maxWidth:'400px', width:'100%', padding:'32px' }}>
          <div style={{ color:'#0F6E56', fontSize:'12px', marginBottom:'16px' }}>// you found this.</div>
          <div style={{ color:'#0F6E56', fontSize:'12px', marginBottom:'8px' }}>// that means something.</div>
          <div style={{ color:'#085041', fontSize:'11px', marginBottom:'32px' }}>leave your certified mail number if you want the webmaster to know you were here.</div>
          {!sent ? (
            <>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid #0F6E56', outline:'none', color:'#9FE1CB', fontFamily:'Courier New, monospace', fontSize:'13px', padding:'8px 0', marginBottom:'16px', boxSizing:'border-box' as const }} autoComplete="off" />
              <button onClick={handleSend} style={{ background:'transparent', border:'1px solid #0F6E56', color:'#0F6E56', fontFamily:'Courier New, monospace', fontSize:'11px', padding:'8px 16px', cursor:'pointer' }}>// TRANSMIT</button>
            </>
          ) : (
            <div style={{ color:'#1D9E75', fontSize:'12px' }}>// transmission logged. the webmaster is always watching.</div>
          )}
        </div>
      )}
    </div>
  )
}
