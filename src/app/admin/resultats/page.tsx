import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

export default async function AdminResultatsPage() {
  const supabase = await createClient()

  const { data: competitions } = await supabase
    .from('competitions')
    .select('id, name, date, status, category:categories(name)')
    .in('status', ['open', 'full', 'finished'])
    .order('date', { ascending: false })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={22} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Résultats</h1>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Sélectionne une compétition pour saisir les résultats et déclencher le calcul des points Circuit Acacias.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {competitions && competitions.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Compétition</th>
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {competitions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{(c.category as { name?: string } | null)?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateShort(c.date)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === 'finished' ? 'bg-purple-100 text-purple-700' :
                      c.status === 'open' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/competitions/${c.id}/resultats`}
                      className="text-sm text-green-700 hover:underline font-medium"
                    >
                      Saisir les résultats →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Trophy size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucune compétition disponible.</p>
            <p className="text-sm mt-1">Les compétitions publiées ou ouvertes apparaissent ici.</p>
          </div>
        )}
      </div>
    </div>
  )
}
