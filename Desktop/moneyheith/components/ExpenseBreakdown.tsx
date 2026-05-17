'use client'

import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { CHART_PALETTE } from '@/lib/constants'
import { formatCurrency, categoryLabel } from '@/lib/utils'

function getCategoryColor(_name: string, fallbackIdx: number): string {
  return CHART_PALETTE[fallbackIdx % CHART_PALETTE.length]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-sm">
      <p className="font-semibold text-black dark:text-white mb-1">
        {row.name}
      </p>
      <p className="text-red-600 font-bold">{formatCurrency(row.value)}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {row.percent.toFixed(1)}% ของรายจ่าย
      </p>
    </div>
  )
}

export default function ExpenseBreakdown() {
  const { transactions, period } = useFinanceStore()

  const { data, total } = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    const end = new Date(now)

    if (period === 'day') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (period === 'month') {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
    } else {
      // year
      start.setMonth(0)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11)
      end.setDate(31)
      end.setHours(23, 59, 59, 999)
    }

    const byCat = new Map<string, number>()
    transactions
      .filter((t) => {
        const tDate = new Date(t.date)
        return t.type === 'expense' && tDate >= start && tDate <= end
      })
      .forEach((t) => {
        byCat.set(t.category, (byCat.get(t.category) || 0) + t.amount)
      })

    const total = Array.from(byCat.values()).reduce((s, v) => s + v, 0)
    const data = Array.from(byCat.entries())
      .map(([name, value], idx) => ({
        name: categoryLabel(name),
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
        color: getCategoryColor(name, idx),
      }))
      .sort((a, b) => b.value - a.value)

    return { data, total }
  }, [transactions, period])

  const getTitleSuffix = () => {
    if (period === 'day') return 'วันนี้'
    if (period === 'month') return 'เดือนนี้'
    return 'ปีนี้'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สัดส่วนรายจ่าย {getTitleSuffix()}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-sm">
            ยังไม่มีรายจ่ายในช่วงนี้
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-full" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  รายจ่ายรวม
                </p>
                <p className="text-lg font-bold text-black dark:text-white">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>

            <div className="w-full mt-4 space-y-2 max-h-44 overflow-y-auto">
              {data.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {row.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {row.percent.toFixed(0)}%
                    </span>
                    <span className="font-semibold text-black dark:text-white text-xs sm:text-sm tabular-nums">
                      {formatCurrency(row.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
