import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendGmail } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const { email, first_name, last_name } = await req.json()
  if (!email || !first_name || !last_name) {
    return NextResponse.json({ error: 'Prénom, nom et email sont obligatoires' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existingAuthUser = existingUsers?.users?.find((u) => u.email === email)
  if (existingAuthUser) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email. Connectez-vous ou utilisez "Mot de passe oublié".' }, { status: 409 })
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })
  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

  const { error: profileError } = await admin.from('users').upsert({
    id: created.user.id,
    email,
    first_name,
    last_name,
    role: 'player',
  }, { onConflict: 'id' })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

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
        subject: 'Bienvenue sur le Circuit Acacias — Créez votre mot de passe',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
            <div style="background:#16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <p style="color:white;font-size:20px;font-weight:900;margin:0">Circuit Acacias</p>
              <p style="color:#bbf7d0;font-size:13px;margin:4px 0 0">Tennis Club des Acacias</p>
            </div>
            <h2 style="color:#111;font-size:22px">Bienvenue ${first_name} !</h2>
            <p style="color:#555">Votre compte a été créé sur le Circuit Acacias. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder à votre espace joueur.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
                Créer mon mot de passe →
              </a>
            </div>
            <p style="color:#888;font-size:13px">Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
            <p style="color:#bbb;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Tennis Club des Acacias · Circuit homologué FFT</p>
          </div>
        `,
      })
    } catch (e) {
      console.error('Gmail send error:', e)
      return NextResponse.json({ error: 'Compte créé mais erreur d\'envoi de l\'email. Contactez un administrateur.' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
