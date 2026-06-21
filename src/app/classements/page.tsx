import { createClient } from '@/lib/supabase/server'
import { Trophy, Medal, Crown } from 'lucide-react'
import Link from 'next/link'
import { MASTERS_STATUS_LABELS } from '@/lib/utils'
import type { Ranking } from '@/types'

export const revalidate = 60

interface Props {
  searchParams: Promise<{ saison?: string }>
}

export default async function ClassementsPage({ searchParams }: Props) {
  const { saison: saisonParam } = await searchParams
  const supabase = await createClient()

  const { data: seasons } = await supabase.from('seasons').select('*').order('start_date', { ascending: false })
  const { data: activeSeason } = await supabase.from('seasons').select('*').eq('active', true).single()
  const season = saisonParam ? seasons?.find((s) => s.id === saisonParam) ?? activeSeason : activeSeason

  const { data: categories } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*, user:public_profiles(first_name, last_name, fft_ranking, fft_club), category:categories(name)')
    .eq('season_id', season?.id ?? '')
    .order('rank', { ascending: true })

  const byCategory = (categories ?? []).reduce<Record<string, Ranking[]>>((acc, cat) => {
    acc[cat.id] = (rankings ?? []).filter((r) => r.category_id === cat.id)
    return acc
  }, {})

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 border-b border-gray-800 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
            <Trophy size={12} />
            {season?.name ?? 'Saison en cours'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Classements</h1>
          <p className="text-gray-400 text-lg max-w-xl mb-6">
            Classements par catégorie — mis à jour automatiquement après chaque compétition.
          </p>
          {seasons && seasons.length > 1 && (
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
              {seasons.map((s) => (
                <Link
                  key={s.id}
                  href={`/classements?saison=${s.id}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    season?.id === s.id ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-14">
        {(categories ?? []).map((category) => {
          const catRankings = byCategory[category.id] ?? []
          return (
            <section key={category.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-green-500 rounded-full" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{category.name}</h2>
                  <p className="text-sm text-gray-400">{catRankings.length} joueur{catRankings.length > 1 ? 's' : ''} classé{catRankings.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              {catRankings.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl py-12 text-center">
                  <Trophy size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucun résultat pour le moment.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-14">Rang</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joueur</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Club</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Cl. FFT</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Étapes</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Points</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Masters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catRankings.map((r, i) => (
                        <tr key={r.id} className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 ${i < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''}`}>
                          <td className="px-5 py-4">
                            {i === 0 ? <Crown size={18} className="text-yellow-500" />
                              : i === 1 ? <Medal size={18} className="text-gray-400" />
                              : i === 2 ? <Medal size={18} className="text-amber-600" />
                              : <span className="text-sm font-bold text-gray-400">{r.rank}</span>}
                          </td>
                          <td className="px-5 py-4">
                            <Link href={`/joueurs/${r.user_id}`} className="font-bold text-gray-900 text-sm hover:text-green-700 transition-colors">
                              {r.user?.first_name} {r.user?.last_name}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">{r.user?.fft_club}</td>
                          <td className="px-5 py-4 text-center hidden sm:table-cell">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{r.user?.fft_ranking ?? '—'}</span>
                          </td>
                          <td className="px-5 py-4 text-center text-sm text-gray-500 hidden lg:table-cell">{r.competitions_played}</td>
                          <td className="px-5 py-4 text-right">
                            <p className="text-lg font-black text-green-600">{r.retained_points}</p>
                            {r.total_points !== r.retained_points && (
                              <p className="text-xs text-gray-300">{r.total_points} brut</p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center hidden sm:table-cell">
                            {r.masters_status !== 'none' && (
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                r.masters_status === 'qualified' ? 'bg-green-100 text-green-700' :
                                r.masters_status === 'wildcard' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-500'}`}>
                                {MASTERS_STATUS_LABELS[r.masters_status]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
