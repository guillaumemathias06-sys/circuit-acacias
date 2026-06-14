import Papa from 'papaparse'
import type { CSVPlayer } from '@/types'

export interface ImportResult {
  players: CSVPlayer[]
  errors: string[]
}

const FIELD_ALIASES: Record<string, keyof CSVPlayer> = {
  prenom: 'first_name', prénom: 'first_name', firstname: 'first_name', first_name: 'first_name',
  nom: 'last_name', lastname: 'last_name', last_name: 'last_name',
  email: 'email',
  telephone: 'phone', téléphone: 'phone', phone: 'phone',
  licence: 'fft_license_number', license: 'fft_license_number', fft_license_number: 'fft_license_number',
  classement: 'fft_ranking', ranking: 'fft_ranking', fft_ranking: 'fft_ranking',
  club: 'fft_club', fft_club: 'fft_club',
  categorie: 'category', catégorie: 'category', category: 'category',
}

export function parseCSV(content: string): ImportResult {
  const errors: string[] = []
  const players: CSVPlayer[] = []

  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  })

  if (result.errors.length) {
    errors.push(...result.errors.map((e) => `Ligne ${e.row}: ${e.message}`))
  }

  result.data.forEach((row: unknown, i: number) => {
    const rawRow = row as Record<string, string>
    const player: Partial<CSVPlayer> = {}

    for (const [key, value] of Object.entries(rawRow)) {
      const mapped = FIELD_ALIASES[key]
      if (mapped) (player as Record<string, string>)[mapped] = value.trim()
    }

    if (!player.first_name || !player.last_name) {
      errors.push(`Ligne ${i + 2}: prénom et nom obligatoires`)
      return
    }

    players.push(player as CSVPlayer)
  })

  return { players, errors }
}

// Parse coller-coller brut: "NOM Prénom Classement Club Licence"
export function parsePastedText(text: string): ImportResult {
  const players: CSVPlayer[] = []
  const errors: string[] = []
  const lines = text.trim().split('\n').filter(Boolean)

  lines.forEach((line, i) => {
    const parts = line.trim().split(/\s{2,}|\t/)
    if (parts.length < 2) {
      errors.push(`Ligne ${i + 1}: format invalide — au moins prénom et nom attendus`)
      return
    }

    const [last_name, first_name, fft_ranking, fft_club, fft_license_number] = parts
    players.push({
      last_name: last_name.trim(),
      first_name: first_name.trim(),
      fft_ranking: fft_ranking?.trim(),
      fft_club: fft_club?.trim(),
      fft_license_number: fft_license_number?.trim(),
    })
  })

  return { players, errors }
}
