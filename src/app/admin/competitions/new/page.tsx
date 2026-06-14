'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Category, PointsScale, Season } from '@/types'

export default function NewCompetitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [scales, setScales] = useState<PointsScale[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])

  const [form, setForm] = useState({
    season_id: '',
    name: '',
    date: '',
    start_time: '',
    category_id: '',
    format: 'TMC',
    max_players: 8,
    min_ranking: '',
    max_ranking: '',
    tenup_url: '',
    referee_name: '',
    status: 'draft',
    points_enabled: true,
    points_scale_id: '',
    retained_results: 6,
    entry_fee: '',
    description: '',
    rules: '',
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('categories').select('*').eq('active', true).order('sort_order'),
      supabase.from('points_scales').select('*').eq('active', true),
      supabase.from('seasons').select('*').order('start_date', { ascending: false }),
    ]).then(([cats, pts, seas]) => {
      setCategories(cats.data ?? [])
      setScales(pts.data ?? [])
      setSeasons(seas.data ?? [])
      if (seas.data?.[0]) setForm((f) => ({ ...f, season_id: seas.data![0].id }))
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('competitions').insert({
      ...form,
      season_id: form.season_id || null,
      category_id: form.category_id || null,
      points_scale_id: form.points_scale_id || null,
      entry_fee: form.entry_fee ? parseFloat(form.entry_fee) : null,
      max_players: Number(form.max_players),
      retained_results: Number(form.retained_results),
    })
    if (!error) {
      router.push('/admin/competitions')
    } else {
      alert(error.message)
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle compétition</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input required className="input" value={form.name} onChange={set('name')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saison *</label>
            <select required className="input" value={form.season_id} onChange={set('season_id')}>
              {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select required className="input" value={form.category_id} onChange={set('category_id')}>
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
            <input type="number" className="input" value={form.max_players} onChange={set('max_players')} min={4} max={128} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <input className="input" value={form.format} onChange={set('format')} placeholder="TMC" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classement min. accepté</label>
            <input className="input" value={form.min_ranking} onChange={set('min_ranking')} placeholder="ex: 15/1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classement max. accepté</label>
            <input className="input" value={form.max_ranking} onChange={set('max_ranking')} placeholder="ex: 30" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien Ten'Up</label>
            <input type="url" className="input" value={form.tenup_url} onChange={set('tenup_url')} placeholder="https://tenup.fft.fr/..." />
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

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>Créer la compétition</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  )
}
