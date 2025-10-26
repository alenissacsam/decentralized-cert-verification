import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar.tsx'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KK Verifier - Blockchain Certificate Verification Platform',
  description:
    'Tamper-proof certificate verification platform for hackathons, colleges, and courses. Issue, verify, and manage certificates on blockchain.',
  keywords:
    'blockchain, certificate, verification, hackathon, education, web3, ethereum, sepolia, web3',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
