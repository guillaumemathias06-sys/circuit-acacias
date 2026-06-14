import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, User, Star, TrendingUp, ArrowRight } from 'lucide-react'
import { MASTERS_STATUS_LABELS, formatDateShort } from '@/lib/utils'

export default async function EspaceJoueurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users').select('*, category:categories(name)').eq('id', user.id).single()

  const { data: season } = await supabase.from('seasons').select('*').eq('active', true).single()

  const { data: ranking } = await supabase
    .from('rankings')
    .select('*, category:categories(name)')
    .eq('user_id', user.id).eq('season_id', season?.id ?? '').single()

  const { data: results } = await supabase
    .from('results')
    .select('*, competition:competitions(name, date, category:categories(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header joueur */}
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-400 text-sm mb-1">Bonjour,</p>
          <h1 className="text-3xl font-black text-white mb-1">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-gray-400 text-sm">
            {profile?.fft_club && <span>{profile.fft_club} · </span>}
            {profile?.fft_ranking && <span className="text-gray-300">{profile.fft_ranking}</span>}
            {profile?.category && <span> · {profile.category.name}</span>}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
            <TrendingUp size={18} className="text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-900">{ranking?.retained_points ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Points retenus</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
            <Trophy size={18} className="text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-900">{ranking?.rank ? `#${ranking.rank}` : '—'}</p>
            <p className="text-xs text-gray-400 mt-1">Classement Circuit</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
            <Star size={18} className="text-yellow-500 mx-auto mb-2" />
            {ranking?.masters_status && ranking.masters_status !== 'none' ? (
              <>
                <p className="text-lg font-black text-green-600">{MASTERS_STATUS_LABELS[ranking.masters_status]}</p>
                <p className="text-xs text-gray-400 mt-1">Masters</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-black text-gray-200">—</p>
                <p className="text-xs text-gray-400 mt-1">Masters</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Résultats */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-green-600" />
                <h2 className="font-bold text-gray-900 text-sm">Mes résultats</h2>
              </div>
              <Link href="/classements" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                Voir le classement <ArrowRight size={11} />
              </Link>
            </div>

            {results && results.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {results.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.competition?.name}</p>
                      <p className="text-xs text-gray-400">{r.competition?.date ? formatDateShort(r.competition.date) : ''}</p>
                    </div>
                    {r.wo ? (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded font-medium">WO</span>
                    ) : r.forfait ? (
                      <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded font-medium">Forfait</span>
                    ) : (
                      <div className="text-right">
                        <p className="text-base font-black text-green-600">{r.points_awarded} pts</p>
                        <p className="text-xs text-gray-400">{r.final_position}e place</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                Aucun résultat pour le moment.
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={15} className="text-green-600" />
                <h2 className="font-bold text-gray-900 text-sm">Mon profil</h2>
              </div>
              <Link href="/espace-joueur/profil" className="text-xs text-green-600 hover:text-green-700">
                Modifier
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                ['Email', profile?.email],
                ['Téléphone', profile?.phone],
                ['Licence FFT', profile?.fft_license_number],
                ['Classement FFT', profile?.fft_ranking],
                ['Club', profile?.fft_club],
                ['Catégorie Circuit', profile?.category?.name],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value as string}</span>
                </div>
              ))}
              {!profile?.fft_license_number && (
                <div className="px-5 py-4">
                  <Link href="/espace-joueur/profil" className="text-xs text-green-600 hover:underline">
                    + Compléter mon profil (licence FFT, classement…)
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
