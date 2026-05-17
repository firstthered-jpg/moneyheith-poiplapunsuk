import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import StickyDailyCostButton from '@/components/StickyDailyCostButton'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Moneyheith PoiplaPunsuk - แดชบอร์ดร้านค้า',
  description: 'Moneyheith PoiplaPunsuk - ระบบบันทึกรายรับ-รายจ่าย และสรุปกำไรขาดทุนสำหรับร้านค้า',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💰</text></svg>',
        sizes: 'any',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={sarabun.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
          {children}
          <StickyDailyCostButton />
        </div>
      </body>
    </html>
  )
}
