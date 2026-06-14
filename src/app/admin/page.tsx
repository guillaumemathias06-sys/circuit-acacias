import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Users, Trophy, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: compCount }, { count: playerCount }, { count: resultCount }] = await Promise.all([
    supabase.from('competitions').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'player'),
    supabase.from('results').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentComps } = await supabase
    .from('competitions')
    .select('id, name, date, status, category:categories(name)')
    .order('date', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Compétitions', value: compCount ?? 0, icon: Calendar, href: '/admin/competitions' },
    { label: 'Joueurs', value: playerCount ?? 0, icon: Users, href: '/admin/joueurs' },
    { label: 'Résultats', value: resultCount ?? 0, icon: Trophy, href: '/admin/resultats' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Compétitions récentes</h2>
          <Link href="/admin/competitions" className="text-sm text-green-700 hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-2">
          {(recentComps ?? []).map((c) => (
            <Link key={c.id} href={`/admin/competitions/${c.id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 -mx-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400">{(c.category as { name?: string } | null)?.name} · {c.date}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                c.status === 'open' ? 'bg-green-100 text-green-700' :
                c.status === 'finished' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-600'
              }`}>{c.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
