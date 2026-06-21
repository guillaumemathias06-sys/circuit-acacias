import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Mentions légales — Circuit Acacias' }

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Accueil
          </Link>
          <h1 className="text-3xl font-black text-white">Mentions légales & CGU</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Éditeur du site</h2>
          <p>
            Le site Circuit Acacias est édité par le Tennis Club Les Acacias, association loi 1901.<br />
            Siège social : 2500 chemin des Colles et des Régagnades, 06610 La Gaude.<br />
            Numéro SIRET : 397 508 425 00022<br />
            Contact : <a href="mailto:tennisclubacacias@gmail.com" className="text-green-700 hover:underline">tennisclubacacias@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Directeur de la publication</h2>
          <p>
            La directrice de la publication est Madame Marie-Noëlle RAGNI, présidente du Tennis Club Les Acacias.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
            La base de données et l&apos;authentification sont hébergées par Supabase Inc.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Objet du site</h2>
          <p>
            Circuit Acacias est un outil interne au Tennis Club Les Acacias permettant de suivre le classement
            et les résultats du circuit de tournois internes homologués FFT organisés par le club.
            Ce site est <strong>complémentaire</strong> aux outils fédéraux Ten&apos;Up et MOJA : les inscriptions
            officielles aux compétitions se font exclusivement sur Ten&apos;Up. Circuit Acacias ne remplace ni
            n&apos;engage la responsabilité de la Fédération Française de Tennis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Compte utilisateur</h2>
          <p>
            La création d&apos;un compte joueur est gratuite et réservée aux adhérents et joueurs participant au
            Circuit Acacias. Chaque utilisateur est responsable de la confidentialité de son mot de passe et
            de l&apos;exactitude des informations renseignées dans son profil (identité, licence FFT, classement).
            Le club se réserve le droit de suspendre ou supprimer un compte en cas d&apos;usage abusif ou
            d&apos;informations erronées.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Données personnelles</h2>
          <p>
            Les données collectées (nom, prénom, email, téléphone, date de naissance, licence et classement FFT)
            sont utilisées exclusivement pour la gestion du Circuit Acacias : identification des joueurs,
            calcul du classement et communication liée aux compétitions du club. Elles ne sont ni vendues,
            ni transmises à des tiers à des fins commerciales.
          </p>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
            de vos données. Vous pouvez modifier vos informations directement depuis votre espace joueur, ou
            adresser une demande à <a href="mailto:tennisclubacacias@gmail.com" className="text-green-700 hover:underline">tennisclubacacias@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Cookies</h2>
          <p>
            Le site utilise uniquement des cookies techniques nécessaires à l&apos;authentification
            (gestion de session via Supabase). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus du site (textes, classements, mise en page) est la propriété du
            Tennis Club Les Acacias. Toute reproduction sans autorisation est interdite, à l&apos;exception
            d&apos;un usage personnel et non commercial.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact</h2>
          <p>
            Pour toute question relative au site, au Circuit Acacias ou à vos données personnelles :{' '}
            <a href="mailto:tennisclubacacias@gmail.com" className="text-green-700 hover:underline">tennisclubacacias@gmail.com</a>
          </p>
        </section>

      </div>
    </div>
  )
}
