import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { VAULT_KEYS } from '@/lib/constants'

export async function POST(req: Request) {
  const { code, bookNumber } = await req.json()
  const supabase = createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: '// authentication required' }, { status: 401 })

  if (bookNumber > 1) {
    const { data: profile } = await supabaseAdmin
      .from('users').select('keys_verified').eq('id', user.id).single()
    const keysVerified = profile?.keys_verified || []
    const required = bookNumber === 2 ? 9 : 21
    if (keysVerified.length < required) {
      return NextResponse.json({ message: '// this code requires a foundation that has not yet been built' }, { status: 403 })
    }
  }

  const { data: book } = await supabaseAdmin
    .from('books').select('*').eq('access_code', code).eq('book_number', bookNumber).single()

  if (!book) return NextResponse.json({ message: '// code not recognized' }, { status: 400 })
  if (book.activated) return NextResponse.json({ message: '// this access point has already been claimed' }, { status: 400 })
  if (new Date(book.access_code_expires_at) < new Date()) {
    return NextResponse.json({ message: '// this code has gone dormant' }, { status: 400 })
  }

  await supabaseAdmin.from('books').update({
    activated: true, activated_by_user_id: user.id, activated_at: new Date().toISOString(),
  }).eq('id', book.id)

  await supabaseAdmin.from('users').update({
    [`book_${bookNumber}_serial`]: book.serial_number,
    [`book_${bookNumber}_activated_at`]: new Date().toISOString(),
    dashboard_unlocked: true,
  }).eq('id', user.id)

  await supabaseAdmin.from('admin_log').insert({
    action: `book_${bookNumber}_activated`, target_user_id: user.id, notes: `serial: ${book.serial_number}`,
  })

  if (book.satellite_redirect) return NextResponse.json({ satelliteRedirect: true, satelliteSlug: book.satellite_node_slug })
  return NextResponse.json({ success: true })
}
