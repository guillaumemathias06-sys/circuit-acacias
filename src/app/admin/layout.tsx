import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, Trophy, Star, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/competitions', label: 'Compétitions', icon: Calendar },
  { href: '/admin/joueurs', label: 'Joueurs', icon: Users },
  { href: '/admin/resultats', label: 'Résultats', icon: Trophy },
  { href: '/admin/classement', label: 'Classement', icon: BarChart3 },
  { href: '/admin/masters', label: 'Masters', icon: Star },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-sm">Administration</p>
          <p className="text-xs text-gray-400">Circuit Acacias</p>
        </div>
        <nav className="p-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
