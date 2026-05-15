'use client'

import React, { useEffect, useState } from 'react'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency } from '@/lib/utils'

export default function WelcomeBanner() {
  const [shopName, setShopName] = useState<string>('ร้านค้า')
  const [isHydrated, setIsHydrated] = useState(false)
  const { getDashboardStats, period } = useFinanceStore()
  const stats = getDashboardStats()

  useEffect(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        if (settings.shopName) {
          setShopName(settings.shopName.split(' ')[0])
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    setIsHydrated(true)
  }, [])

  const today = new Date()
  const dateStr = today.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const getPeriodMessage = () => {
    switch (period) {
      case 'day':
        return `วันนี้ยอดขายของคุณ ${formatCurrency(stats.totalIncome)}`
      case 'month':
        return `เดือนนี้ยอดขาย ${formatCurrency(stats.totalIncome)}`
      case 'year':
        return `ปีนี้ยอดขาย ${formatCurrency(stats.totalIncome)}`
      default:
        return 'ยินดีต้อนรับกลับมา'
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-500 dark:from-purple-700 dark:via-purple-600 dark:to-indigo-700 p-6 sm:p-8 mb-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm text-white/80 mb-2">{dateStr}</p>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              ยินดีต้อนรับกลับมา{isHydrated ? `, ${shopName}!` : '!'}
            </h2>
            <p className="text-white/90 text-sm sm:text-base">
              {getPeriodMessage()}
            </p>
          </div>

          {/* Emoji decorations */}
          <div className="flex flex-col gap-2 text-3xl">
            <span>💰</span>
            <span>📊</span>
          </div>
        </div>
      </div>
    </div>
  )
}
