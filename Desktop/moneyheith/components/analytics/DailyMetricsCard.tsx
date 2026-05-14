'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { fetchDailyData } from '@/lib/queries'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface DailyMetric {
  date: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

interface DailyMetricsCardProps {
  daysBack?: number
  title?: string
}

export default function DailyMetricsCard({ daysBack = 1, title = 'วันนี้' }: DailyMetricsCardProps) {
  const [metrics, setMetrics] = useState<DailyMetric | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)
        const data = await fetchDailyData(daysBack)

        if (data.length > 0) {
          const latest = data[0]
          const revenue = latest.amount > 0 ? latest.amount : 0
          const expenses = latest.amount < 0 ? Math.abs(latest.amount) : 0

          // Recalculate from actual data
          const allRevenue = data
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

          const allExpenses = data
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

          const profit = allRevenue - allExpenses
          const margin = allRevenue > 0 ? (profit / allRevenue) * 100 : 0

          setMetrics({
            date: new Date().toLocaleDateString('th-TH'),
            revenue: allRevenue,
            expenses: allExpenses,
            profit,
            margin,
          })
        } else {
          setMetrics({
            date: new Date().toLocaleDateString('th-TH'),
            revenue: 0,
            expenses: 0,
            profit: 0,
            margin: 0,
          })
        }
        setError(null)
      } catch (err) {
        console.error('Error loading daily metrics:', err)
        setError('ไม่สามารถโหลดข้อมูลได้')
        setMetrics({
          date: new Date().toLocaleDateString('th-TH'),
          revenue: 0,
          expenses: 0,
          profit: 0,
          margin: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [daysBack])

  if (error && !metrics) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-red-600">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500 dark:text-gray-400">
          กำลังโหลด...
        </CardContent>
      </Card>
    )
  }

  const isProfit = metrics.profit >= 0

  return (
    <Card>
      <CardContent className="py-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
          {title}
        </h3>

        <div className="space-y-4">
          {/* Revenue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">รายได้</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(metrics.revenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ค่าใช้จ่าย</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(metrics.expenses)}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Profit */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">กำไรสุทธิ</p>
              <p
                className={`text-2xl font-bold ${
                  isProfit
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isProfit ? '+' : '-'}{formatCurrency(Math.abs(metrics.profit))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">ส่วนกำไร</p>
              <p
                className={`text-2xl font-bold ${
                  metrics.margin >= 20
                    ? 'text-green-600 dark:text-green-400'
                    : metrics.margin >= 10
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metrics.margin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
