import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return format(parseISO(date), 'dd MMMM yyyy', { locale: fr })
}

export function formatDateShort(date: string) {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: fr })
}

export const COMPETITION_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publiée',
  open: 'Inscriptions ouvertes',
  full: 'Complète',
  finished: 'Terminée',
  cancelled: 'Annulée',
}

export const COMPETITION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-blue-100 text-blue-700',
  open: 'bg-green-100 text-green-700',
  full: 'bg-orange-100 text-orange-700',
  finished: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const MASTERS_STATUS_LABELS: Record<string, string> = {
  none: '',
  qualified: 'Qualifié',
  substitute: 'Remplaçant',
  wildcard: 'Wild Card',
}
