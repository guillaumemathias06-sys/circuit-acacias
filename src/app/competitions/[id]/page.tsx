import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExternalLink, Calendar, Clock, Users, User, Euro, ArrowLeft, Trophy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate, COMPETITION_STATUS_LABELS, COMPETITION_STATUS_COLORS } from '@/lib/utils'

export const revalidate = 60

interface Props { params: Promise<{ id: string }> }

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: competition } = await supabase
    .from('competitions')
    .select('*, category:categories(*), points_scale:points_scales(*, rows:points_scale_rows(*))')
    .eq('id', id)
    .neq('status', 'draft')
    .single()

  if (!competition) notFound()

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, user:users(first_name, last_name, fft_ranking, fft_club)')
    .eq('competition_id', id)
    .in('status', ['registered', 'confirmed'])

  const spotsLeft = competition.max_players - (registrations?.length ?? 0)
  const isFull = spotsLeft <= 0

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 border-b border-gray-800 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/competitions" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Toutes les compétitions
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-green-400 text-sm font-semibold uppercase tracking-wider mb-2">{competition.category?.name}</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{competition.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${COMPETITION_STATUS_COLORS[competition.status]}`}>
                {COMPETITION_STATUS_LABELS[competition.status]}
              </span>
            </div>
            {competition.tenup_url && competition.status === 'open' && (
              <a href={competition.tenup_url} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-gray-950 font-black px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                S'inscrire sur Ten'Up
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Infos clés */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Informations</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<Calendar size={16} className="text-green-600" />} label="Date" value={formatDate(competition.date)} />
              {competition.start_time && (
                <InfoItem icon={<Clock size={16} className="text-green-600" />} label="Horaire" value={`${competition.start_time}${competition.end_time ? ` – ${competition.end_time}` : ''}`} />
              )}
              <InfoItem icon={<Users size={16} className="text-green-600" />} label="Format" value={`${competition.format} ${competition.max_players} joueurs`} />
              {competition.referee_name && (
                <InfoItem icon={<User size={16} className="text-green-600" />} label="Juge-arbitre" value={competition.referee_name} />
              )}
              {competition.entry_fee && (
                <InfoItem icon={<Euro size={16} className="text-green-600" />} label="Tarif FFT" value={`${competition.entry_fee} €`} />
              )}
              {competition.min_ranking && (
                <InfoItem icon={<Trophy size={16} className="text-green-600" />} label="Classement" value={`${competition.min_ranking}${competition.max_ranking ? ` → ${competition.max_ranking}` : ''}`} />
              )}
            </div>
          </div>

          {/* Points Circuit */}
          {competition.points_enabled && competition.points_scale && (
            <div className="bg-gray-950 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-green-400" />
                <h2 className="font-bold text-white">Points Circuit Acacias</h2>
                <span className="text-xs text-gray-500 ml-1">— {competition.points_scale.name}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(competition.points_scale as { rows?: { id: string; position_min: number; position_max: number; points: number }[] }).rows
                  ?.sort((a, b) => a.position_min - b.position_min)
                  .map((row) => (
                    <div key={row.id} className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">
                        {row.position_min === row.position_max ? `${row.position_min}e` : `${row.position_min}e–${row.position_max}e`}
                      </p>
                      <p className="text-xl font-black text-green-400">{row.points}</p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Description */}
          {competition.description && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{competition.description}</p>
            </div>
          )}

          {/* Règlement */}
          {competition.rules && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-3">Règlement</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{competition.rules}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* CTA inscription */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-900">Places disponibles</p>
              {isFull
                ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Complet</span>
                : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{spotsLeft} place{spotsLeft > 1 ? 's' : ''}</span>
              }
            </div>

            {/* Barre de remplissage */}
            <div className="bg-gray-100 rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((registrations?.length ?? 0) / competition.max_players) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mb-4">{registrations?.length ?? 0} / {competition.max_players} inscrits</p>

            {competition.tenup_url ? (
              <>
                <a href={competition.tenup_url} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors mb-3">
                  S'inscrire sur Ten'Up →
                </a>
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <CheckCircle size={11} className="text-green-500" />
                  Inscription officielle via la FFT
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center italic">Lien Ten'Up disponible prochainement</p>
            )}
          </div>

          {/* Liste inscrits */}
          {registrations && registrations.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Joueurs inscrits</h3>
              <div className="space-y-2">
                {registrations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.user?.first_name ?? r.raw_first_name} {r.user?.last_name ?? r.raw_last_name}</p>
                      <p className="text-xs text-gray-400">{r.user?.fft_club ?? r.raw_club}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.user?.fft_ranking ?? r.raw_fft_ranking ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
