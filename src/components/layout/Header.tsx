'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const nav = [
  { href: '/competitions', label: 'Compétitions' },
  { href: '/classements', label: 'Classements' },
  { href: '/masters', label: 'Masters' },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isHome = pathname === '/'

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
            <Link
              href="/espace-joueur"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isHome ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Mon espace
            </Link>
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
