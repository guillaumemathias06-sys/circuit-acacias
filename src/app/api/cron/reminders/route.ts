import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendGmail } from '@/lib/gmail'
import { formatDate } from '@/lib/utils'

// Déclenché chaque jour par le cron Vercel (voir vercel.json).
// Envoie un rappel email aux joueurs inscrits à une compétition qui a lieu dans 3 jours.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 3)
  const targetDateStr = targetDate.toISOString().slice(0, 10)

  const { data: competitions, error: compError } = await admin
    .from('competitions')
    .select('id, name, date, start_time, category:categories(name)')
    .eq('date', targetDateStr)
    .in('status', ['open', 'full', 'published'])

  if (compError) return NextResponse.json({ error: compError.message }, { status: 500 })

  let sent = 0
  const errors: string[] = []

  for (const comp of competitions ?? []) {
    const { data: registrations } = await admin
      .from('registrations')
      .select('id, user_id, reminder_sent, user:users(email, first_name)')
      .eq('competition_id', comp.id)
      .in('status', ['registered', 'confirmed'])
      .eq('reminder_sent', false)
      .not('user_id', 'is', null)

    for (const reg of registrations ?? []) {
      const email = (reg.user as { email?: string; first_name?: string } | null)?.email
      const firstName = (reg.user as { email?: string; first_name?: string } | null)?.first_name ?? ''
      if (!email) continue

      try {
        await sendGmail({
          to: email,
          subject: `Rappel — ${comp.name} dans 3 jours`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
              <div style="background:#16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <p style="color:white;font-size:20px;font-weight:900;margin:0">Circuit Acacias</p>
                <p style="color:#bbf7d0;font-size:13px;margin:4px 0 0">Tennis Club des Acacias</p>
              </div>
              <h2 style="color:#111;font-size:22px">Rappel : ${comp.name}</h2>
              <p style="color:#555">Bonjour ${firstName},</p>
              <p style="color:#555">
                Vous êtes inscrit(e) à <strong>${comp.name}</strong>
                ${(comp.category as { name?: string } | null)?.name ? ` (${(comp.category as { name?: string }).name})` : ''}
                qui se déroule le <strong>${formatDate(comp.date)}</strong>${comp.start_time ? ` à ${comp.start_time}` : ''}, soit dans 3 jours.
              </p>
              <p style="color:#888;font-size:13px">Pensez à vérifier votre tableau et votre horaire sur Ten&apos;Up ou MOJA.</p>
              <p style="color:#bbb;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Tennis Club des Acacias · Circuit homologué FFT</p>
            </div>
          `,
        })
        await admin.from('registrations').update({ reminder_sent: true }).eq('id', reg.id)
        sent++
      } catch (e) {
        errors.push(`${email}: ${(e as Error).message}`)
      }
    }
  }

  return NextResponse.json({ success: true, competitions: competitions?.length ?? 0, sent, errors })
}
