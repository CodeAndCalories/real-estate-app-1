import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, message, subject } =
    (body as Record<string, unknown>)

  if (
    typeof name    !== 'string' || !name.trim()    ||
    typeof email   !== 'string' || !email.trim()   ||
    typeof message !== 'string' || !message.trim() ||
    typeof subject !== 'string' || !subject.trim()
  ) {
    return NextResponse.json(
      { error: 'All fields (name, email, subject, message) are required.' },
      { status: 400 }
    )
  }

  try {
    const { error } = await resend.emails.send({
      from: 'noreply@propertysignalhq.com',
      to:   'axigamingclips@gmail.com',
      subject: `PropertySignalHQ Contact: ${subject.trim()}`,
      text: [
        `Name:    ${name.trim()}`,
        `Email:   ${email.trim()}`,
        `Subject: ${subject.trim()}`,
        '',
        `Message:`,
        message.trim(),
      ].join('\n'),
    })

    if (error) {
      console.error('[contact] Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
