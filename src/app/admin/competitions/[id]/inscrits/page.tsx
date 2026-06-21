'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { parseCSV, parsePastedText } from '@/lib/csv-import'
import type { CSVPlayer, Competition, Registration } from '@/types'
import { Upload, Plus, ClipboardPaste, Trash2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default function InscritsPage({ params }: Props) {
  const { id } = use(params)
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [tab, setTab] = useState<'list' | 'csv' | 'manual' | 'paste'>('list')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [pasteText, setPasteText] = useState('')
  const [manual, setManual] = useState({ email: '', first_name: '', last_name: '', fft_license_number: '', fft_ranking: '', fft_club: '' })
  const [manualSuccess, setManualSuccess] = useState('')

  const supabase = createClient()

  async function load() {
    const [{ data: comp }, { data: regs }] = await Promise.all([
      supabase.from('competitions').select('*, category:categories(name)').eq('id', id).single(),
      supabase.from('registrations').select('*, user:users(first_name, last_name, fft_ranking, fft_club)').eq('competition_id', id),
    ])
    setCompetition(comp)
    setRegistrations(regs ?? [])
  }

  useEffect(() => { load() }, [id])

  async function importPlayers(players: CSVPlayer[], source: string) {
    setLoading(true)
    setErrors([])
    const errs: string[] = []

    for (const p of players) {
      // Check if player exists by license
      let userId: string | null = null
      if (p.fft_license_number) {
        const { data } = await supabase.from('users').select('id').eq('fft_license_number', p.fft_license_number).single()
        userId = data?.id ?? null
      }

      // Check duplicate
      const { data: existing } = await supabase
        .from('registrations')
        .select('id')
        .eq('competition_id', id)
        .eq(userId ? 'user_id' : 'raw_fft_license', userId ?? p.fft_license_number ?? '')
        .maybeSingle()

      if (existing) { errs.push(`${p.first_name} ${p.last_name} déjà inscrit`); continue }

      const { error } = await supabase.from('registrations').insert({
        competition_id: id,
        user_id: userId,
        source,
        status: 'registered',
        raw_first_name: p.first_name,
        raw_last_name: p.last_name,
        raw_fft_license: p.fft_license_number,
        raw_fft_ranking: p.fft_ranking,
        raw_club: p.fft_club,
      })
      if (error) errs.push(`${p.first_name} ${p.last_name}: ${error.message}`)
    }

    setErrors(errs)
    setLoading(false)
    load()
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { players, errors: parseErrors } = parseCSV(text)
    if (parseErrors.length) { setErrors(parseErrors); return }
    await importPlayers(players, 'tenup_csv')
  }

  async function handlePaste() {
    const { players, errors: parseErrors } = parsePastedText(pasteText)
    if (parseErrors.length) { setErrors(parseErrors); return }
    await importPlayers(players, 'paste')
  }

  async function handleManual(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors([])
    setManualSuccess('')

    const res = await fetch('/api/players/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...manual, competition_id: id }),
    })
    const data = await res.json()

    if (!res.ok) {
      setErrors([data.error ?? 'Erreur inconnue'])
    } else {
      setManualSuccess(
        data.isNew
          ? `Invitation envoyée à ${manual.email} — le joueur recevra un email pour définir son mot de passe.`
          : `${manual.first_name} ${manual.last_name} ajouté (compte existant).`
      )
      setManual({ email: '', first_name: '', last_name: '', fft_license_number: '', fft_ranking: '', fft_club: '' })
      load()
    }
    setLoading(false)
  }

  async function removeRegistration(regId: string, name: string) {
    if (!confirm(`Retirer ${name} de cette compétition ?`)) return
    await supabase.from('registrations').delete().eq('id', regId)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Inscrits — {competition?.name}
      </h1>
      <p className="text-gray-500 text-sm mb-6">{registrations.length}/{competition?.max_players} joueurs</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([['list', 'Liste'], ['csv', 'Import CSV'], ['manual', 'Ajout manuel'], ['paste', 'Coller-coller']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          {errors.map((e, i) => <p key={i} className="text-sm text-red-700">{e}</p>)}
        </div>
      )}

      {tab === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-left">Club</th>
                <th className="px-4 py-3 text-center">Classement</th>
                <th className="px-4 py-3 text-center">Licence</th>
                <th className="px-4 py-3 text-center">Source</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">
                    {r.user?.first_name ?? r.raw_first_name} {r.user?.last_name ?? r.raw_last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.user?.fft_club ?? r.raw_club}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{r.user?.fft_ranking ?? r.raw_fft_ranking}</td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">{r.raw_fft_license}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">{r.source}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeRegistration(r.id, `${r.user?.first_name ?? r.raw_first_name} ${r.user?.last_name ?? r.raw_last_name}`)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registrations.length === 0 && (
            <p className="text-center py-10 text-gray-400">Aucun inscrit pour le moment.</p>
          )}
        </div>
      )}

      {tab === 'csv' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={18} className="text-green-600" />
            <h2 className="font-semibold">Import CSV Ten'Up / MOJA</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Colonnes attendues : prénom, nom, email, téléphone, licence, classement, club, catégorie
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSV}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
      )}

      {tab === 'manual' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <Plus size={18} className="text-green-600" />
            <h2 className="font-semibold">Ajout manuel</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Un email d'invitation sera envoyé au joueur pour qu'il crée son mot de passe.
          </p>

          {manualSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
              {manualSuccess}
            </div>
          )}

          <form onSubmit={handleManual} className="space-y-3">
            {[
              ['email', 'Email *', 'email', true],
              ['first_name', 'Prénom *', 'text', true],
              ['last_name', 'Nom *', 'text', true],
              ['fft_license_number', 'Numéro licence FFT', 'text', false],
              ['fft_ranking', 'Classement FFT', 'text', false],
              ['fft_club', 'Club', 'text', false],
            ].map(([field, label, type, required]) => (
              <div key={field as string}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                <input
                  type={type as string}
                  required={required as boolean}
                  className="input"
                  value={(manual as Record<string, string>)[field as string]}
                  onChange={(e) => setManual((m) => ({ ...m, [field as string]: e.target.value }))}
                />
              </div>
            ))}
            <Button type="submit" loading={loading}>Ajouter et envoyer l'invitation</Button>
          </form>
        </div>
      )}

      {tab === 'paste' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardPaste size={18} className="text-green-600" />
            <h2 className="font-semibold">Copier-coller rapide</h2>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Collez une liste brute. Format attendu par ligne (séparé par tabulation ou double espace) :<br />
            <code className="text-xs bg-gray-100 px-1 rounded">NOM&nbsp;&nbsp;Prénom&nbsp;&nbsp;Classement&nbsp;&nbsp;Club&nbsp;&nbsp;Licence</code>
          </p>
          <textarea
            className="input min-h-[160px] font-mono text-xs"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="DUPONT  Jean  4/6  TC Acacias  12345678"
          />
          <Button className="mt-3" onClick={handlePaste} loading={loading}>Importer</Button>
        </div>
      )}
    </div>
  )
}
