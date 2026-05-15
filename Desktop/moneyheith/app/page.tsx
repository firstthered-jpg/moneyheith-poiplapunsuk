'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import WelcomeBanner from '@/components/WelcomeBanner'
import StatCard from '@/components/StatCard'
import CashflowChart from '@/components/CashflowChart'
import ExpenseBreakdown from '@/components/ExpenseBreakdown'
import DailyRevenue from '@/components/DailyRevenue'
import TransactionTable from '@/components/TransactionTable'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency } from '@/lib/utils'

const periodLabel = (p: 'day' | 'month' | 'year') =>
  p === 'day' ? 'วันนี้' : p === 'month' ? 'เดือนนี้' : 'ปีนี้'

export default function Dashboard() {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { getDashboardStats, period, setPeriod, fetchTransactions } = useFinanceStore()
  const stats = getDashboardStats()
  const isProfit = stats.netProfit >= 0
  const margin =
    stats.totalIncome > 0
      ? (stats.netProfit / stats.totalIncome) * 100
      : 0

  useEffect(() => {
    const loadData = async () => {
      setIsHydrated(true)
      setIsLoading(true)
      try {
        await fetchTransactions()
      } catch (error) {
        console.error('Failed to load transactions:', error)
      }
      setIsLoading(false)
    }
    loadData()
  }, [fetchTransactions])

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
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              แดชบอร์ดร้านค้า
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              สรุปยอดขาย รายจ่าย และกำไรของร้าน
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start sm:self-auto">
            {(['day', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {periodLabel(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="📈"
            label="ยอดขาย"
            value={formatCurrency(stats.totalIncome)}
            subValue={`${periodLabel(period)}`}
            color="green"
            variant="featured"
          />
          <StatCard
            icon="💸"
            label="รายจ่าย"
            value={formatCurrency(stats.totalExpense)}
            subValue={`${periodLabel(period)}`}
            color="red"
            variant="featured"
          />
          <StatCard
            icon={isProfit ? '💰' : '📉'}
            label={isProfit ? 'กำไรสุทธิ' : 'ขาดทุนสุทธิ'}
            value={formatCurrency(Math.abs(stats.netProfit))}
            subValue={`${periodLabel(period)}`}
            color={isProfit ? 'blue' : 'red'}
            variant="featured"
          />
          <StatCard
            icon="📊"
            label="อัตรากำไร"
            value={`${margin.toFixed(1)}%`}
            subValue={
              margin >= 20 ? 'ดีมาก' : margin >= 10 ? 'ปานกลาง' : 'ควรปรับปรุง'
            }
            color={margin >= 10 ? 'yellow' : 'red'}
            variant="featured"
          />
        </div>

        {/* Quick action - Single button */}
        <Link
          href="/income"
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-6 text-lg shadow-md transition-all hover:shadow-lg"
        >
          + บันทึกยอดขาย
        </Link>

        {/* Daily Revenue */}
        <DailyRevenue />

        {/* Cashflow + Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashflowChart />
          </div>
          <div>
            <ExpenseBreakdown />
          </div>
        </div>

        <TransactionTable />
      </main>
    </div>
  )
}
