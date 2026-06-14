import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tennisclubacacias@gmail.com',
    pass: 'aysdxcgvsnoitpen',
  },
})

try {
  await transporter.sendMail({
    from: 'Circuit Acacias <tennisclubacacias@gmail.com>',
    to: 'guillaumemathias06@gmail.com',
    subject: 'Test Circuit Acacias',
    html: '<p>Test email — ça fonctionne !</p>',
  })
  console.log('✓ Email envoyé avec succès !')
} catch (e) {
  console.error('✗ Erreur :', e.message)
}
