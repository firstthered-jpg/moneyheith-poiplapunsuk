'use client'

import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency } from '@/lib/utils'

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold mb-2 text-black dark:text-white">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">รายรับ</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(row.income)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">รายจ่าย</span>
          <span className="font-semibold text-red-600">
            {formatCurrency(row.expense)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">กำไร</span>
          <span
            className={`font-bold ${
              row.profit >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(row.profit)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function DailyRevenue() {
  const { transactions, period } = useFinanceStore()

  const data = useMemo(() => {
    const now = new Date()
    let buckets: { label: string; income: number; expense: number; profit: number }[] = []

    if (period === 'day') {
      // Show data for today
      buckets = [
        {
          label: 'วันนี้',
          income: 0,
          expense: 0,
          profit: 0,
        },
      ]

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      transactions.forEach((t) => {
        const tDate = new Date(t.date)
        const tDay = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate())
        if (tDay.getTime() === today.getTime()) {
          if (t.type === 'income') buckets[0].income += t.amount
          else buckets[0].expense += t.amount
        }
      })
      buckets[0].profit = buckets[0].income - buckets[0].expense
    } else if (period === 'month') {
      // Show data for each day of the current month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        buckets.push({
          label: `${day}`,
          income: 0,
          expense: 0,
          profit: 0,
        })
      }

      transactions.forEach((t) => {
        const tDate = new Date(t.date)
        if (
          tDate.getFullYear() === now.getFullYear() &&
          tDate.getMonth() === now.getMonth()
        ) {
          const dayIndex = tDate.getDate() - 1
          if (t.type === 'income') buckets[dayIndex].income += t.amount
          else buckets[dayIndex].expense += t.amount
        }
      })

      buckets.forEach((b) => {
        b.profit = b.income - b.expense
      })
    } else {
      // Show data for each month of the year
      for (let i = 0; i < 12; i++) {
        buckets.push({
          label: THAI_MONTHS[i],
          income: 0,
          expense: 0,
          profit: 0,
        })
      }

      transactions.forEach((t) => {
        const tDate = new Date(t.date)
        if (tDate.getFullYear() === now.getFullYear()) {
          const monthIndex = tDate.getMonth()
          if (t.type === 'income') buckets[monthIndex].income += t.amount
          else buckets[monthIndex].expense += t.amount
        }
      })

      buckets.forEach((b) => {
        b.profit = b.income - b.expense
      })
    }

    return buckets
  }, [transactions, period])

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpense = data.reduce((s, d) => s + d.expense, 0)
  const totalProfit = totalIncome - totalExpense

  const getChartTitle = () => {
    if (period === 'day') return 'รายรับรายจ่ายวันนี้'
    if (period === 'month') return 'รายรับรายจ่ายเดือนนี้'
    return 'รายรับรายจ่ายปีนี้'
  }

  const getInterval = () => {
    if (period === 'day') return 0
    if (period === 'month') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      return Math.floor(daysInMonth / 6)
    }
    return 0
  }

  return (
    <Card>
      <CardHeader className="flex-between">
        <div>
          <CardTitle>{getChartTitle()}</CardTitle>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-600 font-medium">
              ▲ รายรับ {formatCurrency(totalIncome)}
            </span>
            <span className="text-red-600 font-medium">
              ▼ รายจ่าย {formatCurrency(totalExpense)}
            </span>
            <span
              className={`font-bold ${
                totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              = {formatCurrency(totalProfit)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="dr-income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dr-expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '11px' }}
              interval={getInterval()}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '11px' }}
              tickFormatter={(value) =>
                value >= 1000 ? `฿${(value / 1000).toFixed(0)}K` : `฿${value}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '13px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#dr-income)"
              name="รายรับ"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#dr-expense)"
              name="รายจ่าย"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
