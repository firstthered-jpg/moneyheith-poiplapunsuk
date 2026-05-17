'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import StatCard from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function Dashboard() {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { fetchTransactions, getMonthlySummary, getDailyCosts } = useFinanceStore()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  useEffect(() => {
    const load = async () => {
      setIsHydrated(true)
      setIsLoading(true)
      try {
        await fetchTransactions()
      } catch (error) {
        console.error('Failed to load transactions:', error)
      }
      setIsLoading(false)
    }
    load()
  }, [fetchTransactions])

  const summary = getMonthlySummary(year, month)
  const recentDailyCosts = useMemo(
    () => getDailyCosts().slice(0, 5),
    [getDailyCosts]
  )

  const monthLabel = useMemo(
    () =>
      new Date(year, month - 1, 1).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
      }),
    [year, month]
  )

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <Header />
        <div className="container-max py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            แดชบอร์ดร้านค้า
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            สรุปต้นทุน รายรับ และเงินคงเหลือของ {monthLabel}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="📈"
            label="ยอดรายรับเดือนนี้"
            value={formatCurrency(summary.revenue)}
            subValue={monthLabel}
            color="green"
            variant="featured"
          />
          <StatCard
            icon="📦"
            label="ต้นทุนรายวันรวม"
            value={formatCurrency(summary.totalDailyCost)}
            subValue={monthLabel}
            color="red"
            variant="featured"
          />
          <StatCard
            icon={summary.storeNet >= 0 ? '💰' : '📉'}
            label={summary.storeNet >= 0 ? 'ยอดสุทธิร้าน' : 'ขาดทุนสุทธิร้าน'}
            value={formatCurrency(Math.abs(summary.storeNet))}
            subValue={`หักโฆษณา ${formatCurrency(summary.ads)}`}
            color={summary.storeNet >= 0 ? 'blue' : 'red'}
            variant="featured"
          />
          <StatCard
            icon={summary.remaining >= 0 ? '🏡' : '⚠️'}
            label={summary.remaining >= 0 ? 'เงินคงเหลือ' : 'ขาดทุนคงเหลือ'}
            value={formatCurrency(Math.abs(summary.remaining))}
            subValue={`หักรายจ่ายในบ้าน ${formatCurrency(summary.totalHousehold)}`}
            color={summary.remaining >= 0 ? 'yellow' : 'red'}
            variant="featured"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/daily-cost"
            className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-5 px-4 shadow-md transition-all hover:shadow-lg"
          >
            <span className="text-2xl mb-1">📦</span>
            <span>บันทึกต้นทุนรายวัน</span>
          </Link>
          <Link
            href="/household"
            className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-5 px-4 shadow-md transition-all hover:shadow-lg"
          >
            <span className="text-2xl mb-1">🏡</span>
            <span>บันทึกรายจ่ายในบ้าน</span>
          </Link>
          <Link
            href="/summary"
            className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-5 px-4 shadow-md transition-all hover:shadow-lg"
          >
            <span className="text-2xl mb-1">📊</span>
            <span>หน้าสรุปยอด</span>
          </Link>
        </div>

        {/* Recent daily costs */}
        <Card>
          <CardHeader className="flex-between">
            <CardTitle>ต้นทุนรายวันล่าสุด</CardTitle>
            <Link
              href="/daily-cost"
              className="text-sm text-primary-400 hover:text-primary-500"
            >
              ดูทั้งหมด →
            </Link>
          </CardHeader>
          <CardContent>
            {recentDailyCosts.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                ยังไม่มีรายการต้นทุน
              </div>
            ) : (
              <div className="divide-y divide-border-light dark:divide-gray-800">
                {recentDailyCosts.map((dc) => {
                  const paid = dc.payments.reduce((s, p) => s + p.amount, 0)
                  const remaining = dc.amount - paid
                  return (
                    <div
                      key={dc.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-black dark:text-white">
                          {formatDate(dc.date)}
                        </p>
                        {dc.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {dc.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ต้นทุน
                          </p>
                          <p className="font-semibold text-black dark:text-white">
                            {formatCurrency(dc.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            คงเหลือ
                          </p>
                          <p
                            className={`font-semibold ${
                              remaining > 0
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
