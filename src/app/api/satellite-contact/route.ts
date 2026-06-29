import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { node, message } = await req.json()
  const supabaseAdmin = createSupabaseAdminClient()
  await supabaseAdmin.from('webmaster_messages').insert({
    trigger_type: 'satellite_contact',
    message_subject: `// satellite contact: ${node}`,
    message_body: message,
  })
  return NextResponse.json({ success: true })
}
