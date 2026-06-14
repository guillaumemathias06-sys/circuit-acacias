import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import MastersAdminClient from './MastersAdminClient'

export default async function AdminMastersPage() {
  const supabase = await createClient()

  const { data: season } = await supabase.from('seasons').select('*').eq('active', true).single()
  const { data: categories } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*, user:users(first_name, last_name, fft_club)')
    .eq('season_id', season?.id ?? '')
    .order('retained_points', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Masters</h1>
      <MastersAdminClient
        season={season}
        categories={categories ?? []}
        rankings={rankings ?? []}
      />
    </div>
  )
}
