import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Vérifier que l'appelant est admin
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

  // Vérifier si l'utilisateur existe déjà dans auth
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existingAuthUser = existingUsers?.users?.find((u) => u.email === email)

  let userId: string

  if (existingAuthUser) {
    userId = existingAuthUser.id
  } else {
    // Envoyer une invitation — le joueur reçoit un email pour définir son mot de passe
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/espace-joueur`,
    })
    if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 })
    userId = invited.user.id
  }

  // Créer ou mettre à jour le profil dans la table users
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

  // Si une compétition est précisée, inscrire le joueur
  if (competition_id) {
    const { data: existing } = await admin
      .from('registrations')
      .select('id')
      .eq('competition_id', competition_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) {
      await admin.from('registrations').insert({
        competition_id,
        user_id: userId,
        source: 'manual',
        status: 'registered',
        raw_first_name: first_name,
        raw_last_name: last_name,
        raw_fft_ranking: fft_ranking,
        raw_club: fft_club,
        raw_fft_license: fft_license_number,
      })
    }
  }

  return NextResponse.json({ success: true, userId, isNew: !existingAuthUser })
}
