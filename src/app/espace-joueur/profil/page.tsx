'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, CheckCircle } from 'lucide-react'

const FFT_RANKINGS = [
  '40', '30/5', '30/4', '30/3', '30/2', '30/1', '30',
  '15/5', '15/4', '15/3', '15/2', '15/1', '15',
  '5/6', '4/6', '3/6', '2/6', '1/6', 'N.C.',
]

function ProfilPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justUpdated = searchParams.get('updated') === '1'
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    gender: '',
    fft_license_number: '',
    fft_ranking: '',
    fft_club: '',
    category_id: '',
  })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const [{ data: profile }, { data: cats }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('categories').select('id, name').eq('active', true).order('sort_order'),
      ])

      if (profile) {
        setForm({
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          phone: profile.phone ?? '',
          birth_date: profile.birth_date ?? '',
          gender: profile.gender ?? '',
          fft_license_number: profile.fft_license_number ?? '',
          fft_ranking: profile.fft_ranking ?? '',
          fft_club: profile.fft_club ?? '',
          category_id: profile.category_id ?? '',
        })
      }
      setCategories(cats ?? [])
    }
    load()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Vérifier les champs obligatoires
    if (!form.first_name || !form.last_name || !form.gender || !form.birth_date || !form.phone || !form.fft_license_number || !form.fft_ranking || !form.fft_club || !form.category_id) {
      setError('Tous les champs sont obligatoires.')
      setLoading(false)
      return
    }

    // Vérifier qu'il n'y a pas de doublon sur la licence FFT
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('fft_license_number', form.fft_license_number)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      setError('Ce numéro de licence FFT est déjà utilisé par un autre compte.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('users').update({
      ...form,
      birth_date: form.birth_date || null,
      gender: form.gender || null,
      category_id: form.category_id || null,
      fft_license_number: form.fft_license_number || null,
      fft_ranking: form.fft_ranking || null,
      fft_club: form.fft_club || null,
      phone: form.phone || null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) { setError(error.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    setTimeout(() => router.push('/espace-joueur/profil?updated=1'), 1000)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière confirmation */}
      {justUpdated && (
        <div className="bg-green-500 text-white px-6 py-3 flex items-center gap-2 justify-center text-sm font-medium">
          <CheckCircle size={16} />
          Profil mis à jour avec succès !
        </div>
      )}
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/espace-joueur" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Mon espace
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <User size={18} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Mon profil</h1>
              <p className="text-gray-400 text-sm">Complétez vos informations pour le Circuit Acacias</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Identité */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-400">Identité</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                <input required className="input" value={form.first_name} onChange={set('first_name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input required className="input" value={form.last_name} onChange={set('last_name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance *</label>
                <input required type="date" className="input" value={form.birth_date} onChange={set('birth_date')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sexe *</label>
                <select required className="input" value={form.gender} onChange={set('gender')}>
                  <option value="">— Choisir —</option>
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone *</label>
                <input required type="tel" className="input" value={form.phone} onChange={set('phone')} placeholder="06 00 00 00 00" />
              </div>
            </div>
          </div>

          {/* Informations FFT */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wider text-gray-400">Informations FFT</h2>
            <p className="text-xs text-gray-400 mb-4">Ces données permettent de vous identifier dans les imports Ten'Up / MOJA.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de licence FFT *</label>
                <input
                  required
                  className="input font-mono"
                  value={form.fft_license_number}
                  onChange={set('fft_license_number')}
                  placeholder="ex : 12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Classement FFT *</label>
                <select required className="input" value={form.fft_ranking} onChange={set('fft_ranking')}>
                  <option value="">— Choisir —</option>
                  {FFT_RANKINGS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Club *</label>
                <input required className="input" value={form.fft_club} onChange={set('fft_club')} placeholder="TC des Acacias" />
              </div>
            </div>
          </div>

          {/* Catégorie Circuit */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wider text-gray-400">Catégorie Circuit *</h2>
            <p className="text-xs text-gray-400 mb-4">Votre catégorie dans le Circuit Acacias.</p>
            <select required className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">— Choisir —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <Save size={15} />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Profil mis à jour</span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProfilPage() {
  return (
    <Suspense>
      <ProfilPageInner />
    </Suspense>
  )
}
