'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Pencil, Trash2, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface Joueur {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  fft_club: string | null
  fft_ranking: string | null
  fft_license_number: string | null
  category: { name: string } | null
}

export default function AdminJoueursPage() {
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFirst, setInviteFirst] = useState('')
  const [inviteLast, setInviteLast] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('*, category:categories(name)')
      .eq('role', 'player')
      .order('last_name', { ascending: true })
    setJoueurs(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteMsg('')
    const res = await fetch('/api/players/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, first_name: inviteFirst, last_name: inviteLast }),
    })
    const data = await res.json()
    if (res.ok) {
      setInviteMsg('Invitation envoyée !')
      setInviteEmail(''); setInviteFirst(''); setInviteLast('')
      setTimeout(() => { setShowInvite(false); setInviteMsg('') }, 2000)
      load()
    } else {
      setInviteMsg(data.error ?? 'Erreur lors de l\'invitation')
    }
    setInviting(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} ? Cette action est irréversible.`)) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('results').delete().eq('user_id', id)
    await supabase.from('registrations').delete().eq('user_id', id)
    await supabase.from('rankings').delete().eq('user_id', id)
    await supabase.from('users').delete().eq('id', id)
    setDeleting(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users size={22} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Joueurs</h1>
        <span className="text-sm text-gray-400">{joueurs.length} joueur(s)</span>
        <button
          onClick={() => setShowInvite(true)}
          className="ml-auto inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <UserPlus size={15} />
          Inviter un joueur
        </button>
      </div>

      {/* Modal invitation */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Inviter un joueur</h2>
            <p className="text-sm text-gray-500 mb-5">Le joueur recevra un email pour créer son mot de passe.</p>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
                  <input required className="input" value={inviteFirst} onChange={e => setInviteFirst(e.target.value)} placeholder="Marie" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                  <input required className="input" value={inviteLast} onChange={e => setInviteLast(e.target.value)} placeholder="Dupont" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input required type="email" className="input" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="marie@exemple.com" />
              </div>
              {inviteMsg && (
                <p className={`text-sm font-medium ${inviteMsg.includes('Invitation') ? 'text-green-600' : 'text-red-500'}`}>{inviteMsg}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={inviting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {inviting ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
                <button type="button" onClick={() => setShowInvite(false)}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {joueurs.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Club</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Cl. FFT</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Catégorie</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Licence FFT</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {joueurs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {j.first_name} {j.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{j.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{j.fft_club ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{j.fft_ranking ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{j.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs hidden md:table-cell">{j.fft_license_number ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/joueurs/${j.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(j.id, `${j.first_name} ${j.last_name}`)}
                        disabled={deleting === j.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun joueur inscrit pour le moment.</p>
            <p className="text-sm mt-1">Invitez des joueurs avec le bouton ci-dessus.</p>
          </div>
        )}
      </div>
    </div>
  )
}
