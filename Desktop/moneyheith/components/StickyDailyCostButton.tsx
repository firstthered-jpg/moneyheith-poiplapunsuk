'use client'

import Link from 'next/link'

export default function StickyDailyCostButton() {
  return (
    <Link
      href="/daily-cost"
      className="fixed bottom-4 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
      title="บันทึกต้นทุนรายวัน"
    >
      <span className="text-2xl">📦</span>
    </Link>
  )
}
