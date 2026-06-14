import Link from 'next/link'
import { ExternalLink, Users, Calendar, ArrowRight } from 'lucide-react'
import { formatDate, COMPETITION_STATUS_LABELS, COMPETITION_STATUS_COLORS } from '@/lib/utils'
import type { Competition } from '@/types'

const STATUS_DOT: Record<string, string> = {
  open: 'bg-green-400',
  published: 'bg-blue-400',
  full: 'bg-orange-400',
  finished: 'bg-gray-400',
  cancelled: 'bg-red-400',
  draft: 'bg-gray-600',
}

interface Props { competition: Competition }

export function CompetitionCard({ competition: c }: Props) {
  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-green-200 hover:shadow-lg hover:shadow-green-50 transition-all duration-300">
      {/* Top band */}
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{c.category?.name}</p>
            <Link href={`/competitions/${c.id}`} className="font-bold text-gray-900 hover:text-green-700 transition-colors text-lg leading-tight line-clamp-2">
              {c.name}
            </Link>
          </div>
          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${COMPETITION_STATUS_COLORS[c.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
            {COMPETITION_STATUS_LABELS[c.status]}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            {formatDate(c.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-gray-400" />
            {c.registrations_count ?? 0}/{c.max_players} joueurs
          </span>
        </div>

        {c.points_enabled && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-5 inline-flex items-center gap-2">
            <span className="text-xs text-gray-500">Points Circuit</span>
            <span className="text-xs font-bold text-green-700">
              {c.format} {c.max_players} joueurs
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link href={`/competitions/${c.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors group-hover:text-green-700">
            Voir le détail <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          {c.tenup_url && c.status === 'open' && (
            <a href={c.tenup_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              S'inscrire sur Ten'Up
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
