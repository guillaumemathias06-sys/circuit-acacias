import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="Circuit Acacias" width={32} height={32} className="rounded-lg" />
              <span className="text-white font-bold">Circuit Acacias</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Le circuit tennis interne du Tennis Club des Acacias. Compétitions homologuées FFT, classement annuel et Masters final.
            </p>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-4">Navigation</p>
            <ul className="space-y-2">
              {[
                ['/competitions', 'Compétitions'],
                ['/classements', 'Classements'],
                ['/masters', 'Masters'],
                ['/espace-joueur', 'Mon espace'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-4">Outils officiels</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Inscriptions officielles → <span className="text-gray-200">Ten'Up (FFT)</span></li>
              <li>Tableaux & résultats → <span className="text-gray-200">MOJA</span></li>
            </ul>
            <p className="text-gray-600 text-xs mt-4 leading-relaxed">
              La web app Circuit Acacias est complémentaire aux outils fédéraux. Elle ne remplace pas Ten'Up ni MOJA.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center text-xs text-gray-600">
          <span>© 2026 Tennis Club des Acacias — Circuit Acacias</span>
          <span className="hidden sm:inline">·</span>
          <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales & CGU</Link>
        </div>
      </div>
    </footer>
  )
}
