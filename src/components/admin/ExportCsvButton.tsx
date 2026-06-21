'use client'

import { Download } from 'lucide-react'

interface Row {
  rank: number | null
  first_name: string | null
  last_name: string | null
  fft_club: string | null
  fft_ranking: string | null
  competitions_played: number | null
  retained_points: number | null
  total_points: number | null
  masters_status: string | null
  category: string
}

export function ExportCsvButton({ rows, filename }: { rows: Row[]; filename: string }) {
  function handleExport() {
    const headers = ['Catégorie', 'Rang', 'Prénom', 'Nom', 'Club', 'Classement FFT', 'Étapes jouées', 'Points retenus', 'Total brut', 'Statut Masters']
    const lines = rows.map((r) => [
      r.category, r.rank, r.first_name, r.last_name, r.fft_club, r.fft_ranking,
      r.competitions_played, r.retained_points, r.total_points, r.masters_status,
    ].map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(';'))

    const csv = '﻿' + [headers.join(';'), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
    >
      <Download size={15} />
      Exporter en CSV
    </button>
  )
}
