'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { fetchExpenseBreakdown } from '@/lib/queries'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseCategory {
  category: string
  total: number
  count: number
  items: any[]
}

interface ExpenseBreakdownProps {
  monthOffset?: number
  title?: string
}

const COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
]

export default function ExpenseBreakdown({ monthOffset = 0, title = 'ค่าใช้จ่ายตามหมวดหมู่' }: ExpenseBreakdownProps) {
  const [breakdown, setBreakdown] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBreakdown = async () => {
      try {
        setLoading(true)
        const data = await fetchExpenseBreakdown(monthOffset)
        setBreakdown(data as ExpenseCategory[])
        setError(null)
      } catch (err) {
        console.error('Error loading expense breakdown:', err)
        setError('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }

    loadBreakdown()
  }, [monthOffset])

  if (error && breakdown.length === 0) {
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

  if (breakdown.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500 dark:text-gray-400">
          ไม่มีข้อมูลค่าใช้จ่าย
        </CardContent>
      </Card>
    )
  }

  const totalExpenses = breakdown.reduce((sum, cat) => sum + cat.total, 0)

  // Prepare data for pie chart
  const chartData = breakdown.map((cat) => ({
    name: cat.category,
    value: cat.total,
    percentage: totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0',
  }))

  return (
    <Card>
      <CardContent className="py-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
          {title}
        </h3>

        {breakdown.length > 0 ? (
          <>
            {/* Pie Chart */}
            <div className="mb-6" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                รายละเอียด
              </h4>
              {breakdown.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {cat.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {cat.count} รายการ
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(cat.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-700 dark:text-gray-300">รวมทั้งสิ้น</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            ไม่มีข้อมูลค่าใช้จ่าย
          </div>
        )}
      </CardContent>
    </Card>
  )
}
