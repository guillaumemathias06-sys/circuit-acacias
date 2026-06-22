import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ScrollText, Trophy, Users, ShieldCheck } from 'lucide-react'
import { BaremesTabs } from '@/components/reglement/BaremesTabs'

export const revalidate = 60

export default async function ReglementPage() {
  const supabase = await createClient()
  const { data: scales } = await supabase
    .from('points_scales')
    .select('*, rows:points_scale_rows(*)')
    .eq('active', true)
    .order('competition_size', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 border-b border-gray-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
            <ScrollText size={12} />
            Règlement
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Règlement du Circuit Acacias</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Format des compétitions, barèmes de points et qualification au Masters — tout ce qu'il faut savoir pour suivre le circuit.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Format TMC */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-green-600" />
            <h2 className="text-2xl font-black text-gray-900">Déroulement des TMC</h2>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Chaque Tournoi Multi-Chances (TMC) est homologué FFT et garantit à chaque joueur inscrit{' '}
              <strong className="text-gray-900">un minimum de 3 matchs joués</strong>, quel que soit le résultat des premiers tours.
            </p>
            <p className="text-gray-500 text-sm">
              L'inscription officielle aux compétitions se fait exclusivement sur Ten'Up. Le tableau, l'horaire et le juge-arbitre
              sont précisés sur la fiche de chaque compétition sur ce site.
            </p>
          </div>
        </section>

        {/* Barèmes */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-green-600" />
            <h2 className="text-2xl font-black text-gray-900">Barèmes de points</h2>
          </div>
          <p className="text-gray-500 mb-6">
            Le nombre de points attribués dépend de votre position finale et du nombre de joueurs inscrits à la compétition.
            Le vainqueur marque toujours <strong className="text-gray-800">100 points</strong>, quelle que soit la taille du tableau.
          </p>

          <BaremesTabs scales={scales ?? []} />
        </section>

        {/* Classement */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-green-600" />
            <h2 className="text-2xl font-black text-gray-900">Classement & Masters</h2>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Seuls vos <strong className="text-gray-900">meilleurs résultats</strong> de la saison sont retenus pour le classement
              (le nombre de résultats retenus est précisé pour chaque compétition). Une mauvaise journée ne vous pénalise donc pas.
            </p>
            <p className="text-gray-700 leading-relaxed">
              En fin de saison, les meilleurs joueurs de chaque catégorie sont qualifiés pour le <strong className="text-gray-900">Masters final</strong>,
              organisé au Tennis Club des Acacias.
            </p>
            <Link href="/classements" className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold text-sm">
              Voir le classement actuel →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
