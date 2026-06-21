'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ListOrdered, Plus, Trash2, Pencil } from 'lucide-react'
import type { PointsScale } from '@/types'

interface Row { id?: string; position_min: number | ''; position_max: number | ''; points: number | '' }

export default function BaremesPage() {
  const [scales, setScales] = useState<PointsScale[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [competitionSize, setCompetitionSize] = useState(8)
  const [active, setActive] = useState(true)
  const [rows, setRows] = useState<Row[]>([{ position_min: 1, position_max: 1, points: 100 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('points_scales')
      .select('*, rows:points_scale_rows(*)')
      .order('name')
    setScales((data ?? []).map((s) => ({ ...s, rows: (s.rows ?? []).sort((a: { position_min: number }, b: { position_min: number }) => a.position_min - b.position_min) })))
  }, [])

  useEffect(() => { load() }, [load])

  function resetForm() {
    setEditingId(null)
    setName('')
    setCompetitionSize(8)
    setActive(true)
    setRows([{ position_min: 1, position_max: 1, points: 100 }])
    setError('')
    setShowForm(false)
  }

  function openNew() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(scale: PointsScale) {
    setEditingId(scale.id)
    setName(scale.name)
    setCompetitionSize(scale.competition_size)
    setActive(scale.active)
    setRows(
      (scale.rows ?? []).map((r) => ({ id: r.id, position_min: r.position_min, position_max: r.position_max, points: r.points }))
    )
    setError('')
    setShowForm(true)
  }

  function addRow() {
    setRows((rs) => [...rs, { position_min: '', position_max: '', points: '' }])
  }

  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, field: keyof Row, value: string) {
    setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [field]: value === '' ? '' : Number(value) } : r))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Le nom est obligatoire.'); return }
    if (rows.some((r) => r.position_min === '' || r.position_max === '' || r.points === '')) {
      setError('Toutes les lignes doivent avoir une position min, max et un nombre de points.'); return
    }
    if (rows.some((r) => Number(r.position_min) > Number(r.position_max))) {
      setError('La position min doit être inférieure ou égale à la position max.'); return
    }

    setSaving(true)

    let scaleId = editingId
    if (editingId) {
      const { error } = await supabase.from('points_scales').update({ name, competition_size: competitionSize, active }).eq('id', editingId)
      if (error) { setError(error.message); setSaving(false); return }
      await supabase.from('points_scale_rows').delete().eq('points_scale_id', editingId)
    } else {
      const { data, error } = await supabase.from('points_scales').insert({ name, competition_size: competitionSize, active }).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      scaleId = data.id
    }

    const { error: rowsError } = await supabase.from('points_scale_rows').insert(
      rows.map((r) => ({ points_scale_id: scaleId, position_min: Number(r.position_min), position_max: Number(r.position_max), points: Number(r.points) }))
    )
    if (rowsError) { setError(rowsError.message); setSaving(false); return }

    setSaving(false)
    resetForm()
    load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le barème "${name}" ? Les compétitions qui l'utilisent perdront leur barème de points.`)) return
    await supabase.from('points_scales').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ListOrdered size={22} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Barèmes de points</h1>
        <button
          onClick={openNew}
          className="ml-auto inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          Nouveau barème
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Un barème définit les points attribués selon la position finale d&apos;un joueur dans une compétition.
        Associez un barème à chaque compétition pour que les points soient calculés automatiquement.
      </p>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Modifier le barème' : 'Nouveau barème'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="TMC 8 joueurs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Taille compétition</label>
                  <input type="number" min={2} className="input" value={competitionSize} onChange={(e) => setCompetitionSize(Number(e.target.value))} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Barème actif (sélectionnable lors de la création d&apos;une compétition)
              </label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Lignes de points</label>
                  <button type="button" onClick={addRow} className="text-xs text-green-600 hover:text-green-700 font-medium">+ Ajouter une ligne</button>
                </div>
                <div className="space-y-2">
                  {rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                      <input type="number" min={1} className="input text-sm" placeholder="Pos. min" value={row.position_min} onChange={(e) => updateRow(i, 'position_min', e.target.value)} />
                      <input type="number" min={1} className="input text-sm" placeholder="Pos. max" value={row.position_max} onChange={(e) => updateRow(i, 'position_max', e.target.value)} />
                      <input type="number" min={0} className="input text-sm" placeholder="Points" value={row.points} onChange={(e) => updateRow(i, 'points', e.target.value)} />
                      <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Ex : 1-1 → 100 pts (1er), 2-2 → 60 pts (2e), 3-4 → 30 pts (3e-4e)...</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {scales.map((scale) => (
          <div key={scale.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{scale.name}</h3>
                <span className="text-xs text-gray-400">— {scale.competition_size} joueurs</span>
                {!scale.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactif</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(scale)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(scale.id, scale.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(scale.rows ?? []).map((r) => (
                <span key={r.id} className="text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg text-gray-600">
                  {r.position_min === r.position_max ? `${r.position_min}e` : `${r.position_min}e–${r.position_max}e`} : <strong className="text-green-700">{r.points} pts</strong>
                </span>
              ))}
              {(scale.rows ?? []).length === 0 && <span className="text-xs text-gray-400 italic">Aucune ligne définie</span>}
            </div>
          </div>
        ))}
        {scales.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
            <ListOrdered size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun barème créé.</p>
          </div>
        )}
      </div>
    </div>
  )
}
