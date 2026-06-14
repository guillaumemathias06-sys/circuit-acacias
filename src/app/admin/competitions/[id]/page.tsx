'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import type { Category, PointsScale, Season } from '@/types'

interface Props { params: Promise<{ id: string }> }

export default function EditCompetitionPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [scales, setScales] = useState<PointsScale[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])

  const [form, setForm] = useState({
    season_id: '', name: '', date: '', start_time: '', category_id: '',
    format: 'TMC', max_players: 8, min_ranking: '', max_ranking: '',
    tenup_url: '', referee_name: '', status: 'draft', points_enabled: true,
    points_scale_id: '', retained_results: 6, entry_fee: '', description: '', rules: '',
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('competitions').select('*').eq('id', id).single(),
      supabase.from('categories').select('*').eq('active', true).order('sort_order'),
      supabase.from('points_scales').select('*').eq('active', true),
      supabase.from('seasons').select('*').order('start_date', { ascending: false }),
    ]).then(([{ data: comp }, { data: cats }, { data: pts }, { data: seas }]) => {
      if (comp) {
        setForm({
          season_id: comp.season_id ?? '',
          name: comp.name ?? '',
          date: comp.date ?? '',
          start_time: comp.start_time ?? '',
          category_id: comp.category_id ?? '',
          format: comp.format ?? 'TMC',
          max_players: comp.max_players ?? 8,
          min_ranking: comp.min_ranking ?? '',
          max_ranking: comp.max_ranking ?? '',
          tenup_url: comp.tenup_url ?? '',
          referee_name: comp.referee_name ?? '',
          status: comp.status ?? 'draft',
          points_enabled: comp.points_enabled ?? true,
          points_scale_id: comp.points_scale_id ?? '',
          retained_results: comp.retained_results ?? 6,
          entry_fee: comp.entry_fee?.toString() ?? '',
          description: comp.description ?? '',
          rules: comp.rules ?? '',
        })
      }
      setCategories(cats ?? [])
      setScales(pts ?? [])
      setSeasons(seas ?? [])
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('competitions').update({
      ...form,
      season_id: form.season_id || null,
      category_id: form.category_id || null,
      points_scale_id: form.points_scale_id || null,
      entry_fee: form.entry_fee ? parseFloat(form.entry_fee) : null,
      max_players: Number(form.max_players),
      retained_results: Number(form.retained_results),
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    if (error) { alert(error.message) } else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette compétition ? Cette action est irréversible.')) return
    setDeleting(true)
    const supabase = createClient()
    // Supprimer les dépendances d'abord
    await supabase.from('results').delete().eq('competition_id', id)
    await supabase.from('registrations').delete().eq('competition_id', id)
    const { error } = await supabase.from('competitions').delete().eq('id', id)
    if (error) { alert(error.message); setDeleting(false) }
    else router.push('/admin/competitions')
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/competitions" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-2 transition-colors">
            <ArrowLeft size={14} /> Compétitions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la compétition</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} />
          {deleting ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input required className="input" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saison</label>
            <select className="input" value={form.season_id} onChange={set('season_id')}>
              <option value="">— Choisir —</option>
              {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">— Choisir —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input required type="date" className="input" value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
            <input type="time" className="input" value={form.start_time} onChange={set('start_time')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de places</label>
            <input type="number" className="input" value={form.max_players} onChange={set('max_players')} min={4} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <input className="input" value={form.format} onChange={set('format')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classement min.</label>
            <input className="input" value={form.min_ranking} onChange={set('min_ranking')} placeholder="ex: 15/1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classement max.</label>
            <input className="input" value={form.max_ranking} onChange={set('max_ranking')} placeholder="ex: 30" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien Ten'Up</label>
            <input type="url" className="input" value={form.tenup_url} onChange={set('tenup_url')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Juge-arbitre</label>
            <input className="input" value={form.referee_name} onChange={set('referee_name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarif FFT (€)</label>
            <input type="number" className="input" value={form.entry_fee} onChange={set('entry_fee')} step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barème de points</label>
            <select className="input" value={form.points_scale_id} onChange={set('points_scale_id')}>
              <option value="">— Aucun —</option>
              {scales.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Résultats retenus</label>
            <input type="number" className="input" value={form.retained_results} onChange={set('retained_results')} min={1} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="draft">Brouillon</option>
              <option value="published">Publiée</option>
              <option value="open">Inscriptions ouvertes</option>
              <option value="full">Complète</option>
              <option value="finished">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input min-h-[80px]" value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Règlement</label>
            <textarea className="input min-h-[80px]" value={form.rules} onChange={set('rules')} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Enregistré</span>}
          <Link href="/admin/competitions" className="text-sm text-gray-500 hover:text-gray-700 ml-auto">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
