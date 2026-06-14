'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Competition, Registration } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

interface ResultRow {
  registration_id: string
  user_id: string | null
  name: string
  fft_ranking: string
  position: number | ''
  wo: boolean
  forfait: boolean
}

export default function ResultatsPage({ params }: Props) {
  const { id } = use(params)
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [rows, setRows] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: comp }, { data: regs }] = await Promise.all([
        supabase.from('competitions').select('*, points_scale:points_scales(*, rows:points_scale_rows(*))').eq('id', id).single(),
        supabase.from('registrations')
          .select('*, user:users(first_name, last_name, fft_ranking)')
          .eq('competition_id', id)
          .in('status', ['registered', 'confirmed']),
      ])
      setCompetition(comp)

      const { data: existingResults } = await supabase
        .from('results')
        .select('*')
        .eq('competition_id', id)

      const resultMap = new Map(existingResults?.map((r) => [r.user_id, r]) ?? [])

      setRows((regs ?? []).map((r: Registration) => {
        const existing = r.user_id ? resultMap.get(r.user_id) : null
        return {
          registration_id: r.id,
          user_id: r.user_id ?? null,
          name: `${r.user?.first_name ?? r.raw_first_name} ${r.user?.last_name ?? r.raw_last_name}`,
          fft_ranking: r.user?.fft_ranking ?? r.raw_fft_ranking ?? '',
          position: existing?.final_position ?? '',
          wo: existing?.wo ?? false,
          forfait: existing?.forfait ?? false,
        }
      }))
    }
    load()
  }, [id])

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()

    await supabase.from('results').delete().eq('competition_id', id)

    const inserts = rows
      .filter((r) => r.position !== '' || r.wo || r.forfait)
      .map((r) => ({
        competition_id: id,
        user_id: r.user_id,
        final_position: r.position === '' ? null : Number(r.position),
        wo: r.wo,
        forfait: r.forfait,
        points_awarded: 0,
      }))

    if (inserts.length) {
      await supabase.from('results').insert(inserts)
    }

    // Déclencher l'attribution des points via RPC
    await supabase.rpc('award_points_for_competition', { p_competition_id: id })
    await supabase.from('competitions').update({ status: 'finished' }).eq('id', id)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sortedRows = [...rows].sort((a, b) => {
    if (a.wo || a.forfait) return 1
    if (b.wo || b.forfait) return -1
    if (a.position === '') return 1
    if (b.position === '') return -1
    return Number(a.position) - Number(b.position)
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Résultats — {competition?.name}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Saisissez le classement final. Les points Circuit Acacias seront attribués automatiquement.
      </p>

      {competition?.points_scale && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 text-xs text-green-700">
          Barème : {competition.points_scale.name} —{' '}
          {(competition.points_scale as { rows?: { position_min: number; position_max: number; points: number }[] }).rows
            ?.sort((a, b) => a.position_min - b.position_min)
            .map((r) => `${r.position_min === r.position_max ? r.position_min + 'e' : r.position_min + '-' + r.position_max + 'e'}: ${r.points}pts`)
            .join(' · ')}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Joueur</th>
              <th className="px-4 py-3 text-center">Cl. FFT</th>
              <th className="px-4 py-3 text-center w-24">Position</th>
              <th className="px-4 py-3 text-center">WO</th>
              <th className="px-4 py-3 text-center">Forfait</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRows.map((row) => (
              <tr key={row.registration_id} className={row.wo || row.forfait ? 'opacity-50' : ''}>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-center text-gray-500">{row.fft_ranking}</td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={1}
                    max={competition?.max_players}
                    className="w-16 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-400"
                    value={row.position}
                    disabled={row.wo || row.forfait}
                    onChange={(e) => setRows((rs) => rs.map((r) =>
                      r.registration_id === row.registration_id
                        ? { ...r, position: e.target.value === '' ? '' : parseInt(e.target.value) }
                        : r
                    ))}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={row.wo}
                    onChange={(e) => setRows((rs) => rs.map((r) =>
                      r.registration_id === row.registration_id ? { ...r, wo: e.target.checked, position: '' } : r
                    ))}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={row.forfait}
                    onChange={(e) => setRows((rs) => rs.map((r) =>
                      r.registration_id === row.registration_id ? { ...r, forfait: e.target.checked, position: '' } : r
                    ))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>
          Valider les résultats & calculer les points
        </Button>
        {saved && <span className="text-sm text-green-600">Résultats sauvegardés !</span>}
      </div>
    </div>
  )
}
