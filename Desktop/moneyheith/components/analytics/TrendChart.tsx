'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { fetchTrendData } from '@/lib/queries'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts'

interface TrendData {
  date: string
  revenue: number
  expenses: number
}

interface TrendChartProps {
  daysBack?: number
  title?: string
}

export default function TrendChart({ daysBack = 30, title = 'เทรนด์รายได้และค่าใช้จ่าย (30 วัน)' }: TrendChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setLoading(true)
        const trendData = await fetchTrendData(daysBack)
        setData(trendData)
        setError(null)
      } catch (err) {
        console.error('Error loading trend data:', err)
        setError('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }

    loadTrendData()
  }, [daysBack])

  if (error && data.length === 0) {
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

  // Format dates for display
  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
    dateObj: new Date(d.date),
  }))

  // Calculate statistics
  const avgRevenue = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length
    : 0
  const avgExpenses = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.expenses, 0) / chartData.length
    : 0
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)
  const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0)

  return (
    <Card>
      <CardContent className="py-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
          {title}
        </h3>

        {chartData.length > 0 ? (
          <>
            {/* Chart */}
            <div className="mb-6" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#999"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis
                    stroke="#999"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#666' }}
                    tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ fill: '#22C55E', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="รายได้"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="ค่าใช้จ่าย"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  รายได้เฉลี่ยต่อวัน
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(avgRevenue)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  รวม: {formatCurrency(totalRevenue)}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  ค่าใช้จ่ายเฉลี่ยต่อวัน
                </p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(avgExpenses)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  รวม: {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>

            {/* Daily Average Net */}
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                กำไรเฉลี่ยต่อวัน
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(avgRevenue - avgExpenses)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                รวม: {formatCurrency(totalRevenue - totalExpenses)}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            ไม่มีข้อมูล
          </div>
        )}
      </CardContent>
    </Card>
  )
}
