'use client'
export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect } from 'react'
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
    await fetch('/api/satellite-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node: 'are/you/awake', message: input }),
    })
    setSent(true)
  }
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
      {!visible ? (
        <span className="font-mono animate-blink" style={{ color: '#0F6E56' }}>█</span>
      ) : (
        <div className="font-mono max-w-md w-full px-8">
          <div className="text-xs mb-6" style={{ color: '#0F6E56' }}>// you found this.</div>
          <div className="text-xs mb-2" style={{ color: '#0F6E56' }}>// that means something.</div>
          <div className="text-xs mb-8" style={{ color: '#085041' }}>
            leave your certified mail number if you want the webmaster to know you were here.
          </div>
          {!sent ? (
            <>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="w-full bg-transparent border-b outline-none py-2 text-sm mb-4"
                style={{ borderColor: '#0F6E56', color: '#9FE1CB' }} autoComplete="off" />
              <button onClick={handleSend}
                className="text-xs border px-4 py-2" style={{ borderColor: '#0F6E56', color: '#0F6E56' }}>
                // TRANSMIT ↗
              </button>
            </>
          ) : (
            <div className="text-xs" style={{ color: '#1D9E75' }}>
              // transmission logged. the webmaster is always watching.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
