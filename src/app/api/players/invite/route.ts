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
  // Générer un mot de passe temporaire à chaque invitation
  const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase() + '!'

  if (existingAuthUser) {
    userId = existingAuthUser.id
    // Mettre à jour le mot de passe pour que le joueur puisse se connecter
    await admin.auth.admin.updateUserById(userId, { password })
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
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

  // Envoyer l'email de bienvenue
  {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://circuit-acacias.vercel.app'
    try {
      await sendGmail({
        to: email,
        subject: 'Bienvenue sur le Circuit Acacias !',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
            <h2 style="color:#15803d">Bienvenue sur le Circuit Acacias, ${first_name} !</h2>
            <p>Un compte a été créé pour vous. Voici vos identifiants de connexion :</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:4px 0"><strong>Email :</strong> ${email}</p>
              <p style="margin:4px 0"><strong>Mot de passe temporaire :</strong> <code style="background:#dcfce7;padding:2px 6px;border-radius:4px">${password}</code></p>
            </div>
            <p>Connectez-vous et changez votre mot de passe dès que possible.</p>
            <a href="${siteUrl}/connexion" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
              Accéder au Circuit Acacias
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px">Tennis Club des Acacias</p>
          </div>
        `,
      })
    } catch (e) {
      console.error('Gmail send error:', e)
    }
  }

  return NextResponse.json({ success: true, userId, isNew: !existingAuthUser })
}
