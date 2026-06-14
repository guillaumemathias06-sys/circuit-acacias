import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { COMPETITION_STATUS_LABELS, COMPETITION_STATUS_COLORS, formatDateShort } from '@/lib/utils'

export default async function AdminCompetitionsPage() {
  const supabase = await createClient()

  const { data: competitions } = await supabase
    .from('competitions')
    .select('*, category:categories(name), registrations_count:registrations(count)')
    .order('date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compétitions</h1>
        <Link href="/admin/competitions/new">
          <Button>
            <Plus size={16} />
            Nouvelle compétition
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Compétition</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-center">Inscrits</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(competitions ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.category?.name}</td>
                <td className="px-4 py-3 text-gray-500">{formatDateShort(c.date)}</td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {Array.isArray(c.registrations_count) ? c.registrations_count[0]?.count ?? 0 : 0}/{c.max_players}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge className={COMPETITION_STATUS_COLORS[c.status]}>
                    {COMPETITION_STATUS_LABELS[c.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/competitions/${c.id}/inscrits`} className="text-xs text-blue-600 hover:underline">Inscrits</Link>
                    <Link href={`/admin/competitions/${c.id}/resultats`} className="text-xs text-green-600 hover:underline">Résultats</Link>
                    <Link href={`/admin/competitions/${c.id}`} className="text-xs text-gray-600 hover:underline">Éditer</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
