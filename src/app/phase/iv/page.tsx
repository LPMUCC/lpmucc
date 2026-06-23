import { Metadata } from 'next'
export const metadata: Metadata = {
  title: '404 | LPMUCC',
  description: '// file not found',
  robots: { index: false, follow: false },
}
// NOTE: The second 'O' in NOT uses U+006F standard — the easter egg is in the word FOUND
// Specifically the 'O' in FOUND is U+006F while surrounding chars are standard
// Detectable only by character inspection — visually identical
export default function PhaseIV() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0A0A' }}>
      <div className="font-mono text-center">
        {/* The O in FOUND (position 1) uses identical-looking but different rendering */}
        {/* Community will discover this only by selecting and inspecting the text */}
        <div className="text-sm" style={{ color: '#1a1a1a' }}>
          {/* FILE NOT FOUND — second O in NOT is the easter egg character */}
          FILE N<span data-phase="iv" style={{ fontVariantNumeric: 'normal' }}>O</span>T FOUND
        </div>
        <div className="mt-4 text-xs animate-blink" style={{ color: '#111' }}>█</div>
      </div>
    </div>
  )
}
