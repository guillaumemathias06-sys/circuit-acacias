import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendGmail } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obligatoire' }, { status: 400 })

  const admin = createAdminClient()
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existingAuthUser = existingUsers?.users?.find((u) => u.email === email)

  // Réponse identique que le compte existe ou non, pour ne pas révéler les emails enregistrés
  if (existingAuthUser) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://circuit-acacias.vercel.app'
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${siteUrl}/nouveau-mot-de-passe` },
    })
    const resetLink = linkData?.properties?.action_link

    if (resetLink) {
      try {
        await sendGmail({
          to: email,
          subject: 'Circuit Acacias — Réinitialisation de votre mot de passe',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
              <div style="background:#16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <p style="color:white;font-size:20px;font-weight:900;margin:0">Circuit Acacias</p>
                <p style="color:#bbf7d0;font-size:13px;margin:4px 0 0">Tennis Club des Acacias</p>
              </div>
              <h2 style="color:#111;font-size:22px">Réinitialisation de mot de passe</h2>
              <p style="color:#555">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
                  Réinitialiser mon mot de passe →
                </a>
              </div>
              <p style="color:#888;font-size:13px">Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
              <p style="color:#bbb;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Tennis Club des Acacias · Circuit homologué FFT</p>
            </div>
          `,
        })
      } catch (e) {
        console.error('Gmail send error:', e)
      }
    }
  }

  return NextResponse.json({ success: true })
}
