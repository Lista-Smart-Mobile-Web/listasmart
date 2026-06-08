import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import SvgDefs from '@/components/SvgDefs'
import RevealObserver from '@/components/RevealObserver'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-text',
})

const TITLE = 'Lista Smart — Economize nas compras do supermercado'
const DESCRIPTION =
  'A Lista Smart compara os preços da sua lista em supermercados da sua cidade e indica onde comprar pelo menor preço. Economize até R$ 400 por mês.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Lista Smart',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${dmMono.variable}`}>
      <body>
        <SvgDefs />
        {children}
        <RevealObserver />
      </body>
    </html>
  )
}
