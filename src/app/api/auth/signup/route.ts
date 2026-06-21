import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendGmail } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const { email, password, first_name, last_name } = await req.json()
  if (!email || !password || !first_name || !last_name) {
    return NextResponse.json({ error: 'Prénom, nom, email et mot de passe sont obligatoires' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existingAuthUser = existingUsers?.users?.find((u) => u.email === email)
  if (existingAuthUser) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email. Connectez-vous ou utilisez "Mot de passe oublié".' }, { status: 409 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://circuit-acacias.vercel.app'

  // Crée le compte (non confirmé) et génère le lien de confirmation en un seul appel
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: { first_name, last_name },
      redirectTo: `${siteUrl}/confirmation-email`,
    },
  })
  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 })

  const userId = linkData.user.id
  const { error: profileError } = await admin.from('users').upsert({
    id: userId,
    email,
    first_name,
    last_name,
    role: 'player',
  }, { onConflict: 'id' })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  const confirmLink = linkData.properties?.action_link

  if (confirmLink) {
    try {
      await sendGmail({
        to: email,
        subject: 'Circuit Acacias — Confirmez votre inscription',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
            <div style="background:#16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <p style="color:white;font-size:20px;font-weight:900;margin:0">Circuit Acacias</p>
              <p style="color:#bbf7d0;font-size:13px;margin:4px 0 0">Tennis Club des Acacias</p>
            </div>
            <h2 style="color:#111;font-size:22px">Bienvenue ${first_name} !</h2>
            <p style="color:#555">Merci de votre inscription au Circuit Acacias. Confirmez votre adresse email pour activer votre compte et accéder à votre espace joueur.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${confirmLink}" style="display:inline-block;background:#16a34a;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
                Confirmer mon inscription →
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
