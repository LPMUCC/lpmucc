import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { VAULT_KEYS } from '@/lib/constants'

export async function POST(req: Request) {
  const { keyNumber, keyWord, chapter, artifactPath } = await req.json()
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: '// authentication required' }, { status: 401 })

  // Validate key word server-side — never expose correct answers to client
  const correctWord = VAULT_KEYS[keyNumber as keyof typeof VAULT_KEYS]
  if (!correctWord || keyWord !== correctWord) {
    return NextResponse.json({
      message: '// transmission not recognized. the word is in the chapter. the chapter is the map.'
    }, { status: 400 })
  }

  // Check not already verified
  const { data: profile } = await supabaseAdmin
    .from('users').select('keys_verified, keys_submitted_at').eq('id', user.id).single()
  if ((profile?.keys_verified || []).includes(keyNumber)) {
    return NextResponse.json({ message: '// this key is already verified in your record' }, { status: 400 })
  }

  // Get signed URL for artifact
  const { data: urlData } = await supabaseAdmin.storage
    .from('vault-artifacts').createSignedUrl(artifactPath, 60 * 60 * 24 * 30)

  // Create submission with IMMUTABLE server-side timestamp
  await supabaseAdmin.from('vault_submissions').insert({
    user_id: user.id,
    key_number: keyNumber,
    key_word: keyWord,
    proof_artifact_url: urlData?.signedUrl || artifactPath,
    submitted_at: new Date().toISOString(), // set by server, never editable
    review_status: 'pending',
  })

  // Update keys_submitted_at (immutable log)
  const submittedAt = profile?.keys_submitted_at || {}
  if (!submittedAt[keyNumber]) {
    await supabaseAdmin.from('users').update({
      keys_submitted_at: { ...submittedAt, [keyNumber]: new Date().toISOString() }
    }).eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
