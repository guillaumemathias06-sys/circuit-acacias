import { createClient } from '@/lib/supabase/server'
import { BarChart3, RefreshCw } from 'lucide-react'
import { MASTERS_STATUS_LABELS } from '@/lib/utils'

export default async function AdminClassementPage() {
  const supabase = await createClient()

  const { data: season } = await supabase.from('seasons').select('*').eq('active', true).single()
  const { data: categories } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*, user:users(first_name, last_name, fft_ranking, fft_club), category:categories(name)')
    .eq('season_id', season?.id ?? '')
    .order('rank', { ascending: true })

  const byCategory = (categories ?? []).reduce<Record<string, typeof rankings>>((acc, cat) => {
    acc[cat.id] = (rankings ?? []).filter((r) => r.category_id === cat.id)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 size={22} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Classement Circuit</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Le classement est recalculé automatiquement à chaque validation de résultats.
        {season && <span className="ml-1 font-medium text-gray-700">{season.name}</span>}
      </p>

      <div className="space-y-8">
        {(categories ?? []).map((cat) => {
          const rows = byCategory[cat.id] ?? []
          return (
            <section key={cat.id}>
              <h2 className="font-semibold text-gray-800 mb-3">{cat.name}</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {rows.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left w-10">Rang</th>
                        <th className="px-4 py-2 text-left">Joueur</th>
                        <th className="px-4 py-2 text-left hidden md:table-cell">Club</th>
                        <th className="px-4 py-2 text-center">Étapes</th>
                        <th className="px-4 py-2 text-center">Pts retenus</th>
                        <th className="px-4 py-2 text-center hidden lg:table-cell">Total brut</th>
                        <th className="px-4 py-2 text-center">Masters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((r) => (
                        <tr key={r?.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-500 font-medium">{r?.rank}</td>
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {r?.user?.first_name} {r?.user?.last_name}
                          </td>
                          <td className="px-4 py-2 text-gray-500 hidden md:table-cell">{r?.user?.fft_club}</td>
                          <td className="px-4 py-2 text-center text-gray-500">{r?.competitions_played}</td>
                          <td className="px-4 py-2 text-center font-bold text-green-700">{r?.retained_points}</td>
                          <td className="px-4 py-2 text-center text-gray-400 hidden lg:table-cell">{r?.total_points}</td>
                          <td className="px-4 py-2 text-center">
                            {r?.masters_status && r.masters_status !== 'none' && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                r.masters_status === 'qualified' ? 'bg-green-100 text-green-700' :
                                r.masters_status === 'wildcard' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {MASTERS_STATUS_LABELS[r.masters_status]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-8 text-gray-400 text-sm">
                    Aucun résultat enregistré pour cette catégorie.
                  </p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
