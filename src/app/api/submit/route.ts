import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { VAULT_KEYS } from '@/lib/constants'

export async function POST(req: Request) {
  const { keyNumber, keyWord, chapter, artifactPath } = await req.json()
  const supabase = createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: '// authentication required' }, { status: 401 })

  const correctWord = VAULT_KEYS[keyNumber as keyof typeof VAULT_KEYS]
  if (!correctWord || keyWord !== correctWord) {
    return NextResponse.json({ message: '// transmission not recognized. the word is in the chapter.' }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from('users').select('keys_verified, keys_submitted_at').eq('id', user.id).single()
  if ((profile?.keys_verified || []).includes(keyNumber)) {
    return NextResponse.json({ message: '// this key is already verified in your record' }, { status: 400 })
  }

  const { data: urlData } = await supabaseAdmin.storage
    .from('vault-artifacts').createSignedUrl(artifactPath, 60 * 60 * 24 * 30)

  await supabaseAdmin.from('vault_submissions').insert({
    user_id: user.id, key_number: keyNumber, key_word: keyWord,
    proof_artifact_url: urlData?.signedUrl || artifactPath,
    submitted_at: new Date().toISOString(), review_status: 'pending',
  })

  const submittedAt = profile?.keys_submitted_at || {}
  if (!submittedAt[keyNumber]) {
    await supabaseAdmin.from('users').update({
      keys_submitted_at: { ...submittedAt, [keyNumber]: new Date().toISOString() }
    }).eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
