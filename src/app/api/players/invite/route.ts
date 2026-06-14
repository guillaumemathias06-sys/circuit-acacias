import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendGmail } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await req.json()
  const { email, first_name, last_name, fft_license_number, fft_ranking, fft_club, category_id, competition_id } = body

  if (!email || !first_name || !last_name) {
    return NextResponse.json({ error: 'Prénom, nom et email sont obligatoires' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existingAuthUser = existingUsers?.users?.find((u) => u.email === email)

  let userId: string

  if (existingAuthUser) {
    userId = existingAuthUser.id
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    })
    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
    userId = created.user.id
  }

  const { error: profileError } = await admin.from('users').upsert({
    id: userId,
    email,
    first_name,
    last_name,
    fft_license_number: fft_license_number || null,
    fft_ranking: fft_ranking || null,
    fft_club: fft_club || null,
    category_id: category_id || null,
    role: 'player',
  }, { onConflict: 'id' })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  if (competition_id) {
    const { data: existing } = await admin
      .from('registrations').select('id')
      .eq('competition_id', competition_id).eq('user_id', userId).maybeSingle()
    if (!existing) {
      await admin.from('registrations').insert({
        competition_id, user_id: userId, source: 'manual', status: 'registered',
        raw_first_name: first_name, raw_last_name: last_name,
        raw_fft_ranking: fft_ranking, raw_club: fft_club, raw_fft_license: fft_license_number,
      })
    }
  }

  // Générer un lien de définition de mot de passe
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://circuit-acacias.vercel.app'
  const { data: linkData } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${siteUrl}/nouveau-mot-de-passe` },
  })

  const resetLink = linkData?.properties?.action_link ?? `${siteUrl}/connexion`

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
          <h2 style="color:#111;font-size:22px">Bonjour ${first_name} !</h2>
          <p style="color:#555">Un compte a été créé pour vous sur le Circuit Acacias. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder à votre espace joueur.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
              Créer mon mot de passe →
            </a>
          </div>
          <p style="color:#888;font-size:13px">Ce lien est valable 24 heures. Si vous n'attendiez pas cet email, ignorez-le.</p>
          <p style="color:#bbb;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Tennis Club des Acacias · Circuit homologué FFT</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('Gmail send error:', e)
  }

  return NextResponse.json({ success: true, userId, isNew: !existingAuthUser })
}
