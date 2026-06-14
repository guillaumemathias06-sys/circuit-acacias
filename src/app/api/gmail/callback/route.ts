import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/gmail/callback`
  )

  const { tokens } = await oauth2Client.getToken(code)

  return new NextResponse(`
    <html><body style="font-family:monospace;padding:40px;background:#111;color:#fff">
      <h2 style="color:#22c55e">✓ Autorisation Google réussie !</h2>
      <p>Copie ce Refresh Token et ajoute-le dans Vercel :</p>
      <p style="background:#222;padding:16px;border-radius:8px;word-break:break-all;color:#86efac">
        ${tokens.refresh_token ?? '❌ Pas de refresh token — relance /api/gmail/auth'}
      </p>
      <p style="color:#9ca3af">Variable : <strong style="color:#fff">GOOGLE_REFRESH_TOKEN</strong></p>
    </body></html>
  `, { headers: { 'Content-Type': 'text/html' } })
}
