
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Harmony Hub - Discord Clone',
  description: 'A full-featured Discord clone with guilds, DMs, and more',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-discord-300 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
