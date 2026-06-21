'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trophy, Star, Shield } from 'lucide-react'

export default function ConnexionPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'login') {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
      router.push('/espace-joueur')
    } else {
      if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
      if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
      setLoading(true)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la création du compte.'); setLoading(false); return }
      setSuccess('Vérifiez votre boîte email pour confirmer votre inscription et accéder à votre espace joueur.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Panneau gauche — marketing */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-gray-950 to-green-950 border-r border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-gray-950 font-black text-sm">CA</span>
            </div>
            <span className="text-white font-bold">Circuit Acacias</span>
          </Link>
        </div>

        <div className="relative">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-4">Votre compte joueur</p>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            Suivez votre progression tout au long de la saison
          </h2>
          <div className="space-y-4">
            {[
              { icon: Trophy, text: 'Consultez vos points et votre rang après chaque étape' },
              { icon: Star, text: 'Suivez votre qualification au Masters en temps réel' },
              { icon: Shield, text: 'Compte distinct de Ten\'Up — votre progression Circuit en un coup d\'œil' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-green-400" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-gray-600 text-xs">Tennis Club des Acacias — Circuit homologué FFT</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-gray-950 font-black text-sm">CA</span>
              </div>
              <span className="text-white font-bold">Circuit Acacias</span>
            </Link>
          </div>

          {/* Toggle */}
          <div className="bg-gray-900 rounded-xl p-1 flex mb-8 border border-gray-800">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-gray-950' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Créer un compte
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-gray-950' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Se connecter
            </button>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">
            {mode === 'register' ? 'Créer mon compte' : 'Bon retour !'}
          </h1>
          <p className="text-gray-400 text-sm mb-7">
            {mode === 'register'
              ? 'Rejoignez le Circuit Acacias et suivez votre progression.'
              : 'Connectez-vous à votre espace joueur.'}
          </p>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={18} className="text-green-400" />
              </div>
              <p className="text-green-300 font-semibold mb-1">Email envoyé !</p>
              <p className="text-green-400/70 text-sm">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Marie"
                      className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    />
                  </div>
                </div>
              )}
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '8 caractères minimum' : 'Votre mot de passe'}
                  className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <Link href="/mot-de-passe-oublie" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 font-black px-6 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Chargement...' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-600 mt-6 text-center leading-relaxed">
            Ce compte est distinct de <span className="text-gray-400">Ten'Up</span>.<br />
            L'inscription aux compétitions se fait sur Ten'Up (FFT).
          </p>
        </div>
      </div>
    </div>
  )
}
