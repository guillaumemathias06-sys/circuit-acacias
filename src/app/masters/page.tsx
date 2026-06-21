import { createClient } from '@/lib/supabase/server'
import { Trophy, Star, Crown, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function MastersPage() {
  const supabase = await createClient()

  const { data: season } = await supabase.from('seasons').select('*').eq('active', true).single()
  const { data: masters } = await supabase
    .from('masters')
    .select('*, category:categories(*)')
    .eq('season_id', season?.id ?? '')
    .eq('published', true)
    .order('created_at')

  const { data: qualified } = await supabase
    .from('rankings')
    .select('*, user:public_profiles(first_name, last_name, fft_ranking, fft_club), category:categories(name, id)')
    .eq('season_id', season?.id ?? '')
    .neq('masters_status', 'none')
    .order('rank', { ascending: true })

  const qualifiedByCategory = (qualified ?? []).reduce<Record<string, typeof qualified>>((acc, q) => {
    if (!acc[q.category_id]) acc[q.category_id] = []
    acc[q.category_id]!.push(q)
    return acc
  }, {})

  const hasQualified = Object.keys(qualifiedByCategory).length > 0

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 border-b border-gray-800 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl mb-6">
            <Trophy className="text-yellow-400" size={24} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Masters Final</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Les meilleurs joueurs de chaque catégorie se qualifient pour le Masters de fin de saison — l'événement ultime du Circuit Acacias.
          </p>
        </div>
      </section>

      {/* Infos Masters */}
      {masters && masters.length > 0 && (
        <section className="bg-gray-900 border-b border-gray-800 py-10 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {masters.map((m) => (
              <div key={m.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">{m.category?.name}</p>
                {m.date && <p className="text-sm font-bold text-white mb-1">{formatDate(m.date)}</p>}
                <div className="flex items-center gap-2">
                  <Users size={12} className="text-yellow-400" />
                  <span className="text-xs text-gray-300">Top {m.max_players} qualifiés</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!hasQualified ? (
          <div className="text-center py-24">
            <Star size={40} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Les qualifications seront publiées prochainement</h2>
            <p className="text-gray-400 text-sm">Le classement est en cours — revenez en fin de saison pour découvrir les qualifiés.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(qualifiedByCategory).map(([catId, players]) => {
              const catName = players?.[0]?.category?.name
              const qualified = players?.filter((p) => p?.masters_status === 'qualified') ?? []
              const wildcards = players?.filter((p) => p?.masters_status === 'wildcard') ?? []
              const subs = players?.filter((p) => p?.masters_status === 'substitute') ?? []

              return (
                <section key={catId}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-yellow-400 rounded-full" />
                    <h2 className="text-2xl font-black text-gray-900">{catName}</h2>
                  </div>

                  {qualified.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Crown size={12} className="text-yellow-500" /> Qualifiés
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {qualified.map((r, i) => (
                          <div key={r?.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-green-200 transition-colors">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                              i === 0 ? 'bg-yellow-400 text-gray-950' :
                              i === 1 ? 'bg-gray-200 text-gray-700' :
                              i === 2 ? 'bg-amber-600 text-white' :
                              'bg-gray-100 text-gray-600'}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{r?.user?.first_name} {r?.user?.last_name}</p>
                              <p className="text-xs text-gray-400 truncate">{r?.user?.fft_club}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-black text-green-600">{r?.retained_points}</p>
                              <p className="text-xs text-gray-400">pts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {wildcards.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Star size={12} className="text-yellow-500" /> Wild Cards
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {wildcards.map((r) => (
                          <div key={r?.id} className="flex items-center gap-4 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                            <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <Star size={14} className="text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">{r?.user?.first_name} {r?.user?.last_name}</p>
                              <p className="text-xs text-gray-400">{r?.user?.fft_club}</p>
                            </div>
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">Wild Card</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {subs.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Remplaçants</p>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                        {subs.map((r, i) => (
                          <div key={r?.id} className="flex items-center gap-4 px-4 py-3">
                            <span className="text-xs font-bold text-gray-400 w-6">R{i + 1}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">{r?.user?.first_name} {r?.user?.last_name}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-500">{r?.retained_points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
