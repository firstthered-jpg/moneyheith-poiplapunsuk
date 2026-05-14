'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { compareMonths } from '@/lib/queries'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ComparisonResult {
  current: any
  previous: any
  revenueChange: number
  revenueChangePercent: number
  profitChange: number
  profitChangePercent: number
}

interface MonthCompareProps {
  month1Offset?: number
  month2Offset?: number
  title?: string
}

export default function MonthCompare({
  month1Offset = 0,
  month2Offset = -1,
  title = 'เปรียบเทียบเดือน',
}: MonthCompareProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadComparison = async () => {
      try {
        setLoading(true)
        const data = await compareMonths(month1Offset, month2Offset)
        setComparison(data)
        setError(null)
      } catch (err) {
        console.error('Error loading comparison:', err)
        setError('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }

    loadComparison()
  }, [month1Offset, month2Offset])

  if (error && !comparison) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-red-600">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500 dark:text-gray-400">
          กำลังโหลด...
        </CardContent>
      </Card>
    )
  }

  if (!comparison) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500 dark:text-gray-400">
          ไม่มีข้อมูล
        </CardContent>
      </Card>
    )
  }

  const revenueUp = comparison.revenueChange >= 0
  const profitUp = comparison.profitChange >= 0

  const MetricRow = ({
    label,
    current,
    previous,
    change,
    changePercent,
    isCurrency = true,
  }: {
    label: string
    current: number
    previous: number
    change: number
    changePercent: number
    isCurrency?: boolean
  }) => {
    const isPositive = change >= 0
    const icon = isPositive ? (
      <TrendingUp size={16} />
    ) : (
      <TrendingDown size={16} />
    )

    return (
      <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">เดือนนี้</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {isCurrency ? formatCurrency(current) : `${current.toFixed(1)}%`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">เดือนก่อน</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {isCurrency ? formatCurrency(previous) : `${previous.toFixed(1)}%`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">เปลี่ยนแปลง</p>
            <div
              className={`flex items-center gap-1 font-bold ${
                isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {icon}
              <span>
                {isPositive ? '+' : ''}
                {changePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="py-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
          {title}
        </h3>

        <div className="space-y-1">
          <MetricRow
            label="รายได้"
            current={comparison.current.revenue}
            previous={comparison.previous.revenue}
            change={comparison.revenueChange}
            changePercent={comparison.revenueChangePercent}
          />

          <MetricRow
            label="ค่าใช้จ่าย"
            current={comparison.current.expenses}
            previous={comparison.previous.expenses}
            change={-comparison.revenueChange} // Inverse for expenses (down is good)
            changePercent={-comparison.revenueChangePercent}
          />

          <MetricRow
            label="กำไรสุทธิ"
            current={comparison.current.profit}
            previous={comparison.previous.profit}
            change={comparison.profitChange}
            changePercent={comparison.profitChangePercent}
          />

          <MetricRow
            label="ส่วนกำไร"
            current={comparison.current.margin}
            previous={comparison.previous.margin}
            change={comparison.current.margin - comparison.previous.margin}
            changePercent={
              comparison.previous.margin > 0
                ? ((comparison.current.margin - comparison.previous.margin) / comparison.previous.margin) * 100
                : 0
            }
            isCurrency={false}
          />
        </div>

        {/* Transaction Count */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">จำนวนรายการ (เดือนนี้)</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {comparison.current.transactionCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">จำนวนรายการ (เดือนก่อน)</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {comparison.previous.transactionCount}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
