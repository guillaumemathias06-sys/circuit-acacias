import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default async function AdminJoueursPage() {
  const supabase = await createClient()

  const { data: joueurs } = await supabase
    .from('users')
    .select('*, category:categories(name)')
    .eq('role', 'player')
    .order('last_name', { ascending: true })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users size={22} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Joueurs</h1>
        <span className="text-sm text-gray-400 ml-auto">{joueurs?.length ?? 0} joueur(s)</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {joueurs && joueurs.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Club</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Cl. FFT</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Catégorie</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Licence FFT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {joueurs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {j.first_name} {j.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{j.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{j.fft_club ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{j.fft_ranking ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{j.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs hidden md:table-cell">{j.fft_license_number ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun joueur inscrit pour le moment.</p>
            <p className="text-sm mt-1">Les joueurs apparaissent ici quand ils créent un compte ou sont importés via CSV.</p>
          </div>
        )}
      </div>
    </div>
  )
}
