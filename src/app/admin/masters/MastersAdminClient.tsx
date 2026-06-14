'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Category, Ranking, Season } from '@/types'

interface Props {
  season: Season | null
  categories: Category[]
  rankings: Ranking[]
}

export default function MastersAdminClient({ season, categories, rankings }: Props) {
  const [qualifiedCount, setQualifiedCount] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.id, 8]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleGenerate() {
    if (!season) return
    setSaving(true)
    const supabase = createClient()

    // Reset all masters_status
    await supabase
      .from('rankings')
      .update({ masters_status: 'none' })
      .eq('season_id', season.id)

    for (const cat of categories) {
      const catRankings = rankings
        .filter((r) => r.category_id === cat.id)
        .sort((a, b) => b.retained_points - a.retained_points)

      const n = qualifiedCount[cat.id] ?? 8

      for (let i = 0; i < catRankings.length; i++) {
        const r = catRankings[i]
        const status = i < n ? 'qualified' : i < n + 4 ? 'substitute' : 'none'
        await supabase
          .from('rankings')
          .update({ masters_status: status })
          .eq('id', r.id)
      }

      // Upsert masters entry
      await supabase.from('masters').upsert({
        season_id: season.id,
        category_id: cat.id,
        max_players: n,
        status: 'upcoming',
        published: true,
      }, { onConflict: 'season_id,category_id' })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Générer les qualifiés</h2>
        <p className="text-sm text-gray-500 mb-5">
          Configurez le nombre de qualifiés par catégorie, puis générez automatiquement la liste. Les remplaçants (4 suivants) sont aussi assignés.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {categories.map((cat) => (
            <div key={cat.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{cat.name}</label>
              <input
                type="number"
                min={1}
                max={32}
                className="input"
                value={qualifiedCount[cat.id] ?? 8}
                onChange={(e) => setQualifiedCount((q) => ({ ...q, [cat.id]: parseInt(e.target.value) }))}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleGenerate} loading={saving}>
            Générer et publier les qualifiés
          </Button>
          {saved && <span className="text-sm text-green-600">Qualifiés générés et publiés !</span>}
        </div>
      </div>

      {/* Preview par catégorie */}
      {categories.map((cat) => {
        const catRankings = rankings
          .filter((r) => r.category_id === cat.id)
          .sort((a, b) => b.retained_points - a.retained_points)
          .slice(0, (qualifiedCount[cat.id] ?? 8) + 4)

        return (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="font-semibold text-gray-800">{cat.name}</p>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {catRankings.map((r, i) => {
                  const n = qualifiedCount[cat.id] ?? 8
                  const isQ = i < n
                  const isSub = i >= n && i < n + 4
                  return (
                    <tr key={r.id} className={isQ ? 'bg-green-50/40' : ''}>
                      <td className="px-4 py-2 text-gray-400 w-8">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">
                        {r.user?.first_name} {r.user?.last_name}
                      </td>
                      <td className="px-4 py-2 text-gray-500">{r.user?.fft_club}</td>
                      <td className="px-4 py-2 text-right font-bold text-green-700">{r.retained_points} pts</td>
                      <td className="px-4 py-2 text-right">
                        {isQ && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Qualifié</span>}
                        {isSub && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Remplaçant</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
