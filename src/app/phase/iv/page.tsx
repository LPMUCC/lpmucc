export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: '404 | LPMUCC',
  description: '// file not found',
  robots: { index: false, follow: false },
}
export default function PhaseIV() {
  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Courier New, monospace' }}>
      <div style={{ color:'#111111', fontSize:'14px' }}>
        FILE N<span data-easter="iv">O</span>T FOUND
      </div>
    </div>
  )
}
