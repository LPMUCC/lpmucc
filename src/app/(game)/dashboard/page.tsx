'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { VAULT_KEYS } from '@/lib/constants'
import { getTierLabel, getTierColor } from '@/lib/tier'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [keysVerified, setKeysVerified] = useState<number[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accountAgeDays, setAccountAgeDays] = useState(0)
  const [vaultCountdown, setVaultCountdown] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      const { data: prof } = await supabase
        .from('users').select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setKeysVerified(prof.keys_verified || [])
        const created = new Date(prof.account_created_at)
        const days = Math.floor((Date.now() - created.getTime()) / 86400000)
        setAccountAgeDays(days)
        if ((prof.keys_verified || []).length === 33 && days < 180) {
          setVaultCountdown(180 - days)
        }
      }

      const { data: subs } = await supabase
        .from('vault_submissions').select('*')
        .eq('user_id', user.id).order('submitted_at', { ascending: false })
      if (subs) setSubmissions(subs)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#04342C' }}>
      <span className="font-mono text-sm terminal-cursor" style={{ color: '#0F6E56' }}>// loading</span>
    </div>
  )

  const tier = profile?.tier || 'piece'
  const book1Unlocked = profile?.book_1_activated_at
  const book2Unlocked = profile?.book_2_activated_at
  const book3Unlocked = profile?.book_3_activated_at

  const keyGroups = [
    { start: 1, end: 9, book: 1, unlocked: !!book1Unlocked, bg: '#04342C', acc: '#1D9E75', label: 'BOOK ONE' },
    { start: 10, end: 21, book: 2, unlocked: !!book2Unlocked, bg: '#1A0E01', acc: '#EF9F27', label: 'BOOK TWO' },
    { start: 22, end: 33, book: 3, unlocked: !!book3Unlocked, bg: '#0D0B1F', acc: '#7F77DD', label: 'BOOK THREE' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#04342C' }}>
      {/* Header */}
      <div className="border-b px-8 py-4 flex justify-between items-center"
        style={{ borderColor: '#0F6E56' }}>
        <span className="font-mono text-sm" style={{ color: '#0F6E56' }}>LPMUCC // VAULT TERMINAL</span>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
          className="font-mono text-xs" style={{ color: '#0F6E56' }}>
          // sign out
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Status bar */}
        <div className="font-mono text-xs mb-8 space-y-1" style={{ color: '#0F6E56' }}>
          <div>
            // <span style={{ color: '#9FE1CB' }}>{profile?.username || user?.email}</span>
            {'  '}·{'  '}
            <span style={{ color: getTierColor(tier), fontWeight: 'bold' }}>
              {getTierLabel(tier)}
            </span>
            {'  '}·{'  '}
            DAY {accountAgeDays} OF HUNT
          </div>
          <div>
            KEYS: {keysVerified.length}/33{'  '}·{'  '}
            BOOKS ACTIVATED: {[book1Unlocked, book2Unlocked, book3Unlocked].filter(Boolean).length}/3{'  '}·{'  '}
            ACCOUNT AGE: {accountAgeDays} DAYS
          </div>
        </div>

        {/* Key grid */}
        {keyGroups.map(group => (
          <div key={group.book} className="mb-8">
            <div className="font-mono text-xs mb-3 tracking-widest"
              style={{ color: group.acc, opacity: 0.6 }}>
              // {group.label}
            </div>
            {!group.unlocked ? (
              <div className="font-mono text-xs py-4 text-center border"
                style={{ borderColor: group.acc + '22', color: '#0F6E56' }}>
                ██████████ BOOK {group.book} NOT YET UNLOCKED ██████████
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: group.end - group.start + 1 }, (_, i) => {
                  const keyNum = group.start + i
                  const verified = keysVerified.includes(keyNum)
                  const pending = submissions.find(s =>
                    s.key_number === keyNum && s.review_status === 'pending')
                  return (
                    <div key={keyNum}
                      className="border p-3 font-mono text-xs transition-all"
                      style={{
                        borderColor: verified ? group.acc : group.acc + '33',
                        background: verified ? group.acc + '11' : 'transparent',
                      }}>
                      <div style={{ color: verified ? group.acc : '#333', marginBottom: 2 }}>
                        {String(keyNum).padStart(2, '0')}
                      </div>
                      {verified ? (
                        <>
                          <div style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                            {VAULT_KEYS[keyNum]}
                          </div>
                          <div style={{ color: '#0F6E56', fontSize: 10 }}>✓ verified</div>
                        </>
                      ) : pending ? (
                        <div style={{ color: '#BA7517' }}>// pending</div>
                      ) : (
                        <div style={{ color: '#222' }}>_ _ _ _ _</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Action buttons */}
        <div className="space-y-3 mt-8">
          <button
            onClick={() => router.push('/submit')}
            className="w-full py-3 font-mono text-sm text-left px-4 border transition-all glitch-hover"
            style={{ borderColor: '#1D9E75', color: '#1D9E75', background: 'transparent' }}>
            // SUBMIT A KEY →
          </button>

          {keysVerified.length >= 9 && !book2Unlocked && (
            <button
              onClick={() => router.push('/activate?book=2')}
              className="w-full py-3 font-mono text-sm text-left px-4 border"
              style={{ borderColor: '#EF9F27', color: '#EF9F27' }}>
              // ACTIVATE BOOK TWO → You have proven yourself to the first volume.
            </button>
          )}

          {keysVerified.length >= 21 && !book3Unlocked && (
            <button
              onClick={() => router.push('/activate?book=3')}
              className="w-full py-3 font-mono text-sm text-left px-4 border"
              style={{ borderColor: '#7F77DD', color: '#7F77DD' }}>
              // ACTIVATE BOOK THREE → The dynasty awaits.
            </button>
          )}

          {keysVerified.length === 33 && vaultCountdown && (
            <div className="w-full py-3 font-mono text-sm px-4 border"
              style={{ borderColor: '#BA7517', color: '#0F6E56' }}>
              // THE VAULT → {vaultCountdown} days remaining
            </div>
          )}

          {keysVerified.length === 33 && !vaultCountdown && (
            <button
              onClick={() => router.push('/vault')}
              className="w-full py-3 font-mono text-sm text-left px-4 border animate-pulse"
              style={{ borderColor: '#BA7517', color: '#BA7517' }}>
              // THE VAULT → THE TIME HAS COME
            </button>
          )}
        </div>

        {/* Timeline */}
        {submissions.length > 0 && (
          <div className="mt-12">
            <div className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#0F6E56' }}>
              // TRANSMISSION LOG
            </div>
            <div className="space-y-2">
              {submissions.slice(0, 10).map(s => (
                <div key={s.id} className="font-mono text-xs flex justify-between"
                  style={{ color: '#0F6E56' }}>
                  <span>
                    KEY #{String(s.key_number).padStart(2, '0')}
                    {' '}·{' '}
                    <span style={{
                      color: s.review_status === 'verified' ? '#1D9E75'
                        : s.review_status === 'rejected' ? '#E24B4A' : '#BA7517'
                    }}>
                      {s.review_status}
                    </span>
                  </span>
                  <span>{new Date(s.submitted_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t font-mono text-xs flex justify-between"
          style={{ borderColor: '#0F6E56', color: '#0F6E56' }}>
          <span>K. LAWLI · LAWLI PUBLISHING · 2026</span>
          <span>
            <a href="https://lpmucc.com" style={{ color: '#BA7517' }}>lpmucc.com</a>
            {' · '}
            <a href="https://lawlipodcast.com/books" style={{ color: '#BA7517' }}>lawlipodcast.com/books</a>
          </span>
        </div>
      </div>
    </div>
  )
}
