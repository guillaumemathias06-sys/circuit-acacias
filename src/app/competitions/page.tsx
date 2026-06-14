import { createClient } from '@/lib/supabase/server'
import { CompetitionCard } from '@/components/competitions/CompetitionCard'
import { Calendar } from 'lucide-react'
import type { Competition } from '@/types'

export const revalidate = 60

export default async function CompetitionsPage() {
  const supabase = await createClient()

  const { data: competitions } = await supabase
    .from('competitions')
    .select('*, category:categories(*), points_scale:points_scales(*), registrations_count:registrations(count)')
    .neq('status', 'draft')
    .order('date', { ascending: true })

  const grouped = (competitions ?? []).reduce<Record<string, Competition[]>>((acc, c) => {
    const cat = c.category?.name ?? 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  const total = competitions?.length ?? 0
  const open = competitions?.filter((c) => c.status === 'open').length ?? 0

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 border-b border-gray-800 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calendar size={12} />
            Saison 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Compétitions</h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">
            Toutes les étapes homologuées FFT du Circuit Acacias. L'inscription officielle se fait sur <span className="text-white font-medium">Ten'Up</span>.
          </p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-2xl font-black text-white">{total}</span>
              <span className="text-gray-500 ml-2">compétition{total > 1 ? 's' : ''}</span>
            </div>
            {open > 0 && (
              <div>
                <span className="text-2xl font-black text-green-400">{open}</span>
                <span className="text-gray-500 ml-2">inscription{open > 1 ? 's' : ''} ouverte{open > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">Aucune compétition publiée pour le moment.</p>
            <p className="text-gray-300 text-sm mt-1">Revenez bientôt — la saison est en cours de planification.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, comps]) => (
            <section key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-green-500 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                <span className="text-sm text-gray-400">{comps.length} étape{comps.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comps.map((c) => <CompetitionCard key={c.id} competition={c} />)}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  )
}
