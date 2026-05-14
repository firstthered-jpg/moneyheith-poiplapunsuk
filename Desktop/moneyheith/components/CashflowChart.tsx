'use client'

import React, { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { useFinanceStore } from '@/lib/store-supabase'

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0].payload
  const profit = row.income - row.expense
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold mb-2 text-black dark:text-white">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">รายรับ</span>
          <span className="font-semibold text-green-600">
            ฿{Number(row.income).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">รายจ่าย</span>
          <span className="font-semibold text-red-600">
            ฿{Number(row.expense).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">กำไรสุทธิ</span>
          <span
            className={`font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}
          >
            ฿{profit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CashflowChart() {
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

  const getChartTitle = () => {
    if (period === 'day') return 'กระแสเงินสดวันนี้'
    if (period === 'month') return 'กระแสเงินสดเดือนนี้'
    return 'กระแสเงินสดปีนี้'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '12px' }}
              tickFormatter={(value) =>
                value >= 1000 ? `฿${(value / 1000).toFixed(0)}K` : `฿${value}`
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              fill="url(#cf-income)"
              radius={[8, 8, 0, 0]}
              name="รายรับ"
              maxBarSize={40}
            />
            <Bar
              dataKey="expense"
              fill="url(#cf-expense)"
              radius={[8, 8, 0, 0]}
              name="รายจ่าย"
              maxBarSize={40}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={3}
              name="กำไรสุทธิ"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
