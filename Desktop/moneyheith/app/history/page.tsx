import React, { Suspense } from 'react'
import Header from '@/components/Header'
import HistoryContent from '@/components/HistoryContent'

export const metadata = {
  title: 'ประวัติรายการ | Moneyheith',
  description: 'ดูและจัดการรายการทั้งหมด',
}

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6">
        <Suspense fallback={<div className="text-center text-gray-500">กำลังโหลด...</div>}>
          <HistoryContent />
        </Suspense>
      </main>
    </div>
  )
}
