'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Menu, X, LayoutDashboard, User, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const nav = [
  { href: '/competitions', label: 'Compétitions' },
  { href: '/classements', label: 'Classements' },
  { href: '/masters', label: 'Masters' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [adminMenu, setAdminMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const isHome = pathname === '/'
  const isInAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('users').select('role').single().then(({ data }) => {
      setIsAdmin(data?.role === 'admin')
    })
  }, [])

  // Ferme le menu admin si on clique ailleurs
  useEffect(() => {
    if (!adminMenu) return
    const close = () => setAdminMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [adminMenu])

  return (
    <header className={cn(
      'sticky top-0 z-50 border-b transition-colors',
      isHome
        ? 'bg-gray-950/90 backdrop-blur border-gray-800'
        : 'bg-white border-gray-200'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-gray-950 font-black text-sm">CA</span>
            </div>
            <div>
              <span className={cn('font-bold text-base', isHome ? 'text-white' : 'text-gray-900')}>
                Circuit Acacias
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? isHome ? 'text-white bg-white/10' : 'text-green-700 bg-green-50'
                    : isHome ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              /* Switcher admin */
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setAdminMenu((v) => !v)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isInAdmin
                      ? 'bg-green-500 text-gray-950 font-bold'
                      : isHome
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {isInAdmin ? (
                    <><LayoutDashboard size={14} /> Administration</>
                  ) : (
                    <><User size={14} /> Mon espace</>
                  )}
                  <ChevronDown size={13} className={cn('transition-transform', adminMenu && 'rotate-180')} />
                </button>

                {adminMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
                    <Link
                      href="/espace-joueur"
                      onClick={() => setAdminMenu(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                        !isInAdmin ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <User size={15} />
                      <div>
                        <p className="font-medium">Espace joueur</p>
                        <p className="text-xs text-gray-400">Mes points et résultats</p>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100" />
                    <Link
                      href="/admin"
                      onClick={() => setAdminMenu(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                        isInAdmin ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <LayoutDashboard size={15} />
                      <div>
                        <p className="font-medium">Administration</p>
                        <p className="text-xs text-gray-400">Gérer le circuit</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/espace-joueur"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isHome ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Mon espace
              </Link>
            )}
            <Link
              href="/connexion"
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          <button
            className={cn('md:hidden p-2 rounded-md', isHome ? 'text-gray-300' : 'text-gray-600')}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className={cn('md:hidden border-t px-4 py-3 space-y-1', isHome ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100')}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm font-medium',
                isHome ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/espace-joueur"
            onClick={() => setOpen(false)}
            className={cn(
              'block px-3 py-2 rounded-lg text-sm font-medium',
              isHome ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Mon espace
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50"
            >
              Administration
            </Link>
          )}
          <Link
            href="/connexion"
            onClick={() => setOpen(false)}
            className="block w-full text-center bg-green-500 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm mt-2"
          >
            Créer un compte
          </Link>
        </div>
      )}
    </header>
  )
}
