'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-gray-950" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Mot de passe oublié</h1>
          <p className="text-gray-400 text-sm">
            Indiquez votre email, vous recevrez un lien pour réinitialiser votre mot de passe si un compte existe.
          </p>
        </div>

        {sent ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
            <p className="text-green-300 font-semibold mb-1">Email envoyé !</p>
            <p className="text-green-400/70 text-sm">
              Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation sous peu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 font-black px-6 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>
        )}

        <Link href="/connexion" className="mt-6 flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
