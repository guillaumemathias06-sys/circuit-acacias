'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function ConfirmationEmailPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // generateLink (type signup) redirige avec #access_token=...&refresh_token=... dans le hash
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) { setError('Lien expiré ou invalide. Recommencez votre inscription.'); return }
          setDone(true)
          setTimeout(() => router.push('/espace-joueur/profil'), 1800)
        })
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setDone(true)
          setTimeout(() => router.push('/espace-joueur/profil'), 1800)
        } else {
          setError('Lien expiré ou invalide. Recommencez votre inscription.')
        }
      })
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-4 text-sm text-red-400">{error}</div>
        ) : done ? (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={22} className="text-gray-950" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Email confirmé !</h1>
            <p className="text-gray-400 text-sm">Redirection vers votre espace joueur...</p>
          </>
        ) : (
          <div className="text-gray-400 text-sm">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Confirmation en cours...
          </div>
        )}
      </div>
    </div>
  )
}
