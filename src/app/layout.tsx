import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Circuit Acacias — Tennis Club des Acacias',
  description: "Des compétitions homologuées FFT toute l'année, un classement annuel interne et un Masters final au Tennis Club des Acacias.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
