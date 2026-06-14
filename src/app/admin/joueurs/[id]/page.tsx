'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

const FFT_RANKINGS = [
  '40', '30/5', '30/4', '30/3', '30/2', '30/1', '30',
  '15/5', '15/4', '15/3', '15/2', '15/1', '15',
  '5/6', '4/6', '3/6', '2/6', '1/6', 'N.C.',
]

interface Props { params: Promise<{ id: string }> }

export default function EditJoueurPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', birth_date: '',
    gender: '', fft_license_number: '', fft_ranking: '', fft_club: '', category_id: '',
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('users').select('*').eq('id', id).single(),
      supabase.from('categories').select('id, name').eq('active', true).order('sort_order'),
    ]).then(([{ data: u }, { data: cats }]) => {
      if (u) setForm({
        first_name: u.first_name ?? '',
        last_name: u.last_name ?? '',
        phone: u.phone ?? '',
        birth_date: u.birth_date ?? '',
        gender: u.gender ?? '',
        fft_license_number: u.fft_license_number ?? '',
        fft_ranking: u.fft_ranking ?? '',
        fft_club: u.fft_club ?? '',
        category_id: u.category_id ?? '',
      })
      setCategories(cats ?? [])
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
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
    }).eq('id', id)
    if (error) { alert(error.message) } else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="max-w-xl">
      <Link href="/admin/joueurs" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft size={14} /> Joueurs
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le joueur</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input required className="input" value={form.first_name} onChange={set('first_name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input required className="input" value={form.last_name} onChange={set('last_name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input type="date" className="input" value={form.birth_date} onChange={set('birth_date')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <select className="input" value={form.gender} onChange={set('gender')}>
              <option value="">— Choisir —</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" className="input" value={form.phone} onChange={set('phone')} placeholder="06 00 00 00 00" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de licence FFT</label>
            <input className="input font-mono" value={form.fft_license_number} onChange={set('fft_license_number')} placeholder="12345678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classement FFT</label>
            <select className="input" value={form.fft_ranking} onChange={set('fft_ranking')}>
              <option value="">— Choisir —</option>
              {FFT_RANKINGS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
            <input className="input" value={form.fft_club} onChange={set('fft_club')} placeholder="TC des Acacias" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie Circuit</label>
            <select className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">— Non définie —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
            <Save size={14} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Enregistré</span>}
          <Link href="/admin/joueurs" className="text-sm text-gray-500 hover:text-gray-700 ml-auto">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
