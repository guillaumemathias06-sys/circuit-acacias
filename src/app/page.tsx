import Link from 'next/link'
import { ArrowRight, Trophy, Star, ChevronRight, Shield, Calendar, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const groupStyles: Record<string, { color: string; desc: string }> = {
  Hommes: { color: 'from-blue-600 to-blue-800', desc: 'Joueurs classés FFT' },
  Femmes: { color: 'from-rose-500 to-rose-700', desc: 'Joueuses classées FFT' },
  Jeunes: { color: 'from-amber-500 to-amber-700', desc: 'Compétiteurs en développement' },
}

const steps = [
  { n: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous en 1 minute sur la plateforme Circuit Acacias.' },
  { n: '02', title: 'Inscrivez-vous aux étapes', desc: 'Chaque compétition est homologuée FFT. L\'inscription officielle se fait sur Ten\'Up.' },
  { n: '03', title: 'Accumulez des points', desc: 'Chaque place finale vous rapporte des points. Seuls vos meilleurs résultats comptent.' },
  { n: '04', title: 'Qualifiez-vous au Masters', desc: 'Les 8 meilleurs de chaque catégorie s\'affrontent lors du Masters de fin de saison.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: scale } = await supabase
    .from('points_scales')
    .select('*, rows:points_scale_rows(*)')
    .eq('active', true)
    .order('competition_size', { ascending: true })
    .limit(1)
    .maybeSingle()

  const scaleRows = (scale?.rows ?? [])
    .sort((a: { position_min: number }, b: { position_min: number }) => a.position_min - b.position_min)
    .slice(0, 8)

  const maxPoints = scaleRows[0]?.points ?? 1
  const barColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900']

  const { data: categories } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')
  const adultCats = (categories ?? []).filter((c) => !c.age_min)
  const juniorCats = (categories ?? []).filter((c) => c.age_min)

  const categoryGroups = [
    {
      group: 'Hommes',
      sub: adultCats.filter((c) => c.gender === 'M').map((c) => c.name.replace('Hommes ', '')),
    },
    {
      group: 'Femmes',
      sub: adultCats.filter((c) => c.gender === 'F').map((c) => c.name.replace('Femmes ', '')),
    },
    {
      group: 'Jeunes',
      sub: juniorCats.map((c) => c.name),
    },
  ].filter((g) => g.sub.length > 0)

  const stats = [
    { value: String((categories ?? []).length), label: 'Classements' },
    { value: '8+', label: 'Étapes par saison' },
    { value: '100', label: 'Points max par étape' },
    { value: '1', label: 'Masters final' },
  ]

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gray-950 min-h-[92vh] flex flex-col justify-center">
        {/* Grille décorative */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Halo vert */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          {/* Badge saison */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Saison 2026 — Inscriptions ouvertes
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Le circuit tennis<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              qui récompense
            </span>
            <br />votre régularité
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Des compétitions homologuées FFT tout au long de la saison, un classement interne par catégorie
            et un <strong className="text-white">Masters final</strong> au Tennis Club des Acacias.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/connexion"
              className="group inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/25"
            >
              Créer mon compte gratuitement
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/competitions"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium px-6 py-4 rounded-xl border border-gray-800 hover:border-gray-600 transition-all text-base"
            >
              Voir les compétitions
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-800 rounded-2xl overflow-hidden border border-gray-800">
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-gray-900 px-6 py-6 text-center">
                <p className="text-3xl font-black text-white mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flèche bas */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 animate-bounce">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* CONCEPT */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Comment ça marche</p>
            <h2 className="text-4xl font-black text-gray-950 mb-4">De la compétition au Masters,<br />en 4 étapes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="relative group">
                <div className="bg-gray-50 rounded-2xl p-6 h-full border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all duration-300">
                  <p className="text-5xl font-black text-green-500/30 group-hover:text-green-500/50 transition-colors mb-4 leading-none">{n}</p>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="py-24 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-400 font-semibold text-sm uppercase tracking-widest mb-3">Votre niveau, votre circuit</p>
            <h2 className="text-4xl font-black text-white mb-4">{categoryGroups.length} groupes,<br />{(categories ?? []).length} classements distincts</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Hommes, Femmes, Jeunes — chaque groupe est divisé en sous-catégories avec son propre classement et ses qualifiés au Masters final.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            {categoryGroups.map(({ group, sub }) => (
              <Link key={group} href="/classements" className="group relative overflow-hidden rounded-2xl flex">
                <div className={`bg-gradient-to-br ${groupStyles[group]?.color ?? 'from-gray-600 to-gray-800'} p-6 flex flex-col justify-between min-h-48 w-full`}>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Trophy size={18} className="text-white" />
                    </div>
                    <span className="text-white/50 text-xs font-medium">{sub.length} catégorie{sub.length > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-white text-2xl mb-1">{group}</h3>
                    <p className="text-white/60 text-xs mb-3">{groupStyles[group]?.desc ?? ''}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sub.map((s) => (
                        <span key={s} className="bg-white/15 text-white/90 text-xs px-2 py-0.5 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BARÈME */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Système de points</p>
              <h2 className="text-4xl font-black text-gray-950 mb-4">Chaque match compte.<br />Les meilleurs résultats aussi.</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Vous marquez des points à chaque étape selon votre classement final. Seuls vos <strong className="text-gray-800">meilleurs résultats</strong> sont retenus pour le classement — la régularité est récompensée, mais une mauvaise journée ne vous pénalise pas.
              </p>
              <Link href="/classements" className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700">
                Voir le classement actuel <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-gray-950 rounded-2xl p-6 text-white">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-semibold">
                Barème {scale?.name ?? ''}
              </p>
              <div className="space-y-2">
                {scaleRows.map((row: { id: string; position_min: number; position_max: number; points: number }, i: number) => (
                  <div key={row.id} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6 text-right">
                      {row.position_min === row.position_max ? `${row.position_min}e` : `${row.position_min}-${row.position_max}e`}
                    </span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className={`${barColors[i] ?? 'bg-green-900'} h-2 rounded-full`}
                        style={{ width: `${Math.max(8, (row.points / maxPoints) * 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm w-14 text-right">{row.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MASTERS CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-green-800 to-green-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/15 rounded-2xl mb-6">
            <Star className="text-yellow-400" size={28} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Le Masters vous attend</h2>
          <p className="text-green-200 text-lg mb-10 leading-relaxed">
            En fin de saison, les <strong className="text-white">8 meilleurs joueurs</strong> de chaque catégorie se qualifient pour le Masters final du Circuit Acacias. Un événement unique, une finale de prestige.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/connexion"
              className="group inline-flex items-center justify-center gap-2 bg-white text-green-900 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all hover:scale-105 shadow-xl"
            >
              Je veux me qualifier
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/masters"
              className="inline-flex items-center justify-center gap-2 text-white font-medium px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all"
            >
              Voir les qualifiés actuels
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER REASSURANCE */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield size={18} className="text-green-700" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Homologué FFT</h3>
            <p className="text-sm text-gray-500">Toutes les compétitions comptent pour votre classement officiel FFT.</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={18} className="text-green-700" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Toute la saison</h3>
            <p className="text-sm text-gray-500">Des étapes régulières de janvier à décembre pour jouer à votre rythme.</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users size={18} className="text-green-700" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Compte gratuit</h3>
            <p className="text-sm text-gray-500">Créez votre compte pour suivre vos points, votre rang et vos qualifications.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
