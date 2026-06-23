import { Metadata } from 'next'
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
export default function Vault33() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#000000' }}>
      <span className="font-mono text-2xl animate-blink" style={{ color: '#BA7517' }}>█</span>
    </div>
  )
}
