import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { code, bookNumber } = await req.json()
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: '// authentication required' }, { status: 401 })

  // Check prerequisite keys for Books 2 and 3
  if (bookNumber > 1) {
    const { data: profile } = await supabaseAdmin
      .from('users').select('keys_verified').eq('id', user.id).single()
    const keysVerified = profile?.keys_verified || []
    const required = bookNumber === 2 ? 9 : 21
    if (keysVerified.length < required) {
      return NextResponse.json({
        message: `// this code requires a foundation that has not yet been built. continue with the current volume.`
      }, { status: 403 })
    }
  }

  // Find the book
  const { data: book } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('access_code', code)
    .eq('book_number', bookNumber)
    .single()

  if (!book) return NextResponse.json({ message: '// code not recognized' }, { status: 400 })
  if (book.activated) return NextResponse.json({ message: '// this access point has already been claimed' }, { status: 400 })
  if (new Date(book.access_code_expires_at) < new Date()) {
    return NextResponse.json({ message: '// this code has gone dormant. the game is alive. static books are not.' }, { status: 400 })
  }

  // Activate
  await supabaseAdmin.from('books').update({
    activated: true,
    activated_by_user_id: user.id,
    activated_at: new Date().toISOString(),
  }).eq('id', book.id)

  // Update user profile
  const updateField = `book_${bookNumber}_serial`
  const activatedField = `book_${bookNumber}_activated_at`
  await supabaseAdmin.from('users').update({
    [updateField]: book.serial_number,
    [activatedField]: new Date().toISOString(),
    dashboard_unlocked: true,
  }).eq('id', user.id)

  // Log admin action
  await supabaseAdmin.from('admin_log').insert({
    action: `book_${bookNumber}_activated`,
    target_user_id: user.id,
    notes: `serial: ${book.serial_number}`,
  })

  if (book.satellite_redirect && book.satellite_node_slug) {
    return NextResponse.json({ satelliteRedirect: true, satelliteSlug: book.satellite_node_slug })
  }
  return NextResponse.json({ success: true })
}
