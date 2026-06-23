import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export async function POST(req: Request) {
  const { node, message } = await req.json()
  await supabaseAdmin.from('webmaster_messages').insert({
    trigger_type: 'satellite_contact',
    message_subject: `// satellite contact: ${node}`,
    message_body: message,
  })
  return NextResponse.json({ success: true })
}
