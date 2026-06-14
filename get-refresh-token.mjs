import { google } from 'googleapis'
import http from 'http'
import { exec } from 'child_process'

const CLIENT_ID = '615051075190-7i8i0rl47sa951g8siqns96lr56qcfp1.apps.googleusercontent.com'
const CLIENT_SECRET = 'G0CSPX-eCzHU6CpSIyXpBxppSMxrdKL_0uI'
const REDIRECT = 'http://localhost:4000/callback'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT)

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
})

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/callback')) return
  const code = new URL(req.url, 'http://localhost:4000').searchParams.get('code')
  const { tokens } = await oauth2Client.getToken(code)
  res.end(`
    <h2 style="color:green;font-family:sans-serif">✓ Refresh Token obtenu !</h2>
    <p style="font-family:monospace;background:#f0f0f0;padding:16px;border-radius:8px;word-break:break-all">
      ${tokens.refresh_token}
    </p>
    <p style="font-family:sans-serif">Copie ce token et ajoute-le dans Vercel comme <strong>GOOGLE_REFRESH_TOKEN</strong></p>
  `)
  server.close()
})

server.listen(4000, () => {
  console.log('Ouverture du navigateur...')
  exec(`open "${url}"`)
  console.log('En attente de l\'autorisation Google...')
})
