'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'

function getLastNMonths(n: number) {
  const now = new Date()
  const months: { year: number; month: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return months
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('th-TH', {
    month: 'short',
    year: '2-digit',
  })
}

function monthLabelFull(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('th-TH', {
    month: 'long',
    year: 'numeric',
  })
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default function AnalyticsPage() {
  const { fetchTransactions, getMonthlySummary } = useFinanceStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchTransactions()
      setIsLoading(false)
    }
    load()
  }, [fetchTransactions])

  const months = useMemo(() => getLastNMonths(6), [])

  const summaries = useMemo(
    () =>
      months.map((m) => {
        const s = getMonthlySummary(m.year, m.month)
        return { year: m.year, monthNum: m.month, ...s }
      }),
    [months, getMonthlySummary]
  )

  const current = summaries[summaries.length - 1]
  const previous = summaries[summaries.length - 2]

  const chartData = useMemo(
    () =>
      summaries.map((s) => ({
        name: monthLabel(s.year, s.monthNum),
        รายรับ: s.revenue,
        ต้นทุน: s.totalDailyCost,
        โฆษณา: s.ads,
        กำไรสุทธิ: s.storeNet,
        ในบ้าน: s.totalHousehold,
      })),
    [summaries]
  )

  const now = new Date()
  const currentMonthLabel = monthLabelFull(now.getFullYear(), now.getMonth() + 1)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <Header />
        <div className="container-max py-8 text-center text-gray-600 dark:text-gray-400">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            วิเคราะห์ยอด
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            รายงานรายเดือน กราฟแนวโน้ม และเปรียบเทียบ
          </p>
        </div>

        {/* ── Monthly Report Card ── */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-900">
          <CardHeader>
            <CardTitle>รายงานเดือน {currentMonthLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MetricCard
                label="รายรับ"
                value={current.revenue}
                prev={previous.revenue}
                color="text-green-600 dark:text-green-400"
              />
              <MetricCard
                label="ต้นทุนรายวัน"
                value={current.totalDailyCost}
                prev={previous.totalDailyCost}
                color="text-red-600 dark:text-red-400"
                inverted
              />
              <MetricCard
                label="ค่าโฆษณา"
                value={current.ads}
                prev={previous.ads}
                color="text-orange-600 dark:text-orange-400"
                inverted
              />
              <MetricCard
                label="ยอดสุทธิร้าน"
                value={current.storeNet}
                prev={previous.storeNet}
                color="text-blue-600 dark:text-blue-400"
              />
              <MetricCard
                label="รายจ่ายในบ้าน"
                value={current.totalHousehold}
                prev={previous.totalHousehold}
                color="text-pink-600 dark:text-pink-400"
                inverted
              />
              <MetricCard
                label="เงินคงเหลือ"
                value={current.remaining}
                prev={previous.remaining}
                color="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Trend Chart ── */}
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้ม 6 เดือน</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.every((d) => d.รายรับ === 0 && d.ต้นทุน === 0) ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                ยังไม่มีข้อมูลเพียงพอ
              </div>
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="รายรับ" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ต้นทุน" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="กำไรสุทธิ" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Month-by-month Comparison Table ── */}
        <Card>
          <CardHeader>
            <CardTitle>เปรียบเทียบรายเดือน</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">
                    รายการ
                  </th>
                  {summaries.map((s) => (
                    <th
                      key={s.month}
                      className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {monthLabel(s.year, s.monthNum)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompRow label="รายรับ" data={summaries} field="revenue" color="text-green-600 dark:text-green-400" />
                <CompRow label="ต้นทุนรายวัน" data={summaries} field="totalDailyCost" color="text-red-600 dark:text-red-400" />
                <CompRow label="ค่าโฆษณา" data={summaries} field="ads" color="text-orange-600 dark:text-orange-400" />
                <CompRow label="ยอดสุทธิร้าน" data={summaries} field="storeNet" color="text-blue-600 dark:text-blue-400" bold />
                <CompRow label="รายจ่ายในบ้าน" data={summaries} field="totalHousehold" color="text-pink-600 dark:text-pink-400" />
                <CompRow label="เงินคงเหลือ" data={summaries} field="remaining" color="text-emerald-600 dark:text-emerald-400" bold />
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function MetricCard({
  label,
  value,
  prev,
  color,
  inverted = false,
}: {
  label: string
  value: number
  prev: number
  color: string
  inverted?: boolean
}) {
  const change = pctChange(value, prev)
  const isPositive = inverted ? change <= 0 : change >= 0

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</p>
      {prev !== undefined && (
        <p
          className={`text-xs mt-1 font-medium ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}% จากเดือนก่อน
        </p>
      )}
    </div>
  )
}

function CompRow({
  label,
  data,
  field,
  color,
  bold = false,
}: {
  label: string
  data: Array<Record<string, any>>
  field: string
  color: string
  bold?: boolean
}) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className={`py-2 pr-4 whitespace-nowrap ${bold ? 'font-bold' : 'font-medium'} text-gray-700 dark:text-gray-300`}>
        {label}
      </td>
      {data.map((s, i) => (
        <td
          key={i}
          className={`py-2 px-2 text-right whitespace-nowrap ${bold ? 'font-bold' : 'font-medium'} ${color}`}
        >
          {formatCurrency(s[field])}
        </td>
      ))}
    </tr>
  )
}
