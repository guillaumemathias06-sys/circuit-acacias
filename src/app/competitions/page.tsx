'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CompetitionCard } from '@/components/competitions/CompetitionCard'
import { Calendar, Filter } from 'lucide-react'
import type { Competition } from '@/types'

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [userCategoryId, setUserCategoryId] = useState<string | null>(null)
  const [filterMine, setFilterMine] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('users').select('category_id').eq('id', user.id).single()
        setUserCategoryId(profile?.category_id ?? null)
      }

      const { data } = await supabase
        .from('competitions')
        .select('*, category:categories(*), points_scale:points_scales(*), registrations_count:registrations(count)')
        .neq('status', 'draft')
        .order('date', { ascending: true })
      setCompetitions(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = competitions.filter((c) => {
    if (filterMine && userCategoryId && c.category_id !== userCategoryId) return false
    if (dateFrom && c.date < dateFrom) return false
    return true
  })

  const grouped = filtered.reduce<Record<string, Competition[]>>((acc, c) => {
    const cat = c.category?.name ?? 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  const total = competitions.length
  const open = competitions.filter((c) => c.status === 'open').length

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

      {/* Filtres */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span className="font-medium">Filtres</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">À partir du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500"
            />
            {dateFrom && (
              <button onClick={() => setDateFrom('')} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          {userCategoryId && (
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <div
                onClick={() => setFilterMine((v) => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${filterMine ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filterMine ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-600">Afficher uniquement les compétitions auxquelles j'ai le droit de participer</span>
            </label>
          )}
        </div>
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-24 text-gray-400">Chargement...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">Aucune compétition pour ces critères.</p>
            {filterMine && (
              <button onClick={() => setFilterMine(false)} className="text-green-600 text-sm mt-2 hover:underline">
                Voir toutes les compétitions
              </button>
            )}
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
