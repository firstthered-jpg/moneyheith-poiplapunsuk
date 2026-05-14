'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { fetchMonthlyStats, compareMonths, fetchTrendData } from '@/lib/queries'

interface HealthScoreData {
  score: number
  revenueTrend: string
  expenseControl: string
  profitMargin: string
  growthMomentum: string
}

interface HealthScoreProps {
  title?: string
}

export default function HealthScore({ title = 'สุขภาพธุรกิจ' }: HealthScoreProps) {
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const calculateHealth = async () => {
      try {
        setLoading(true)

        // Get current month and previous month for comparison
        const currentMonth = await fetchMonthlyStats(0)
        const previousMonth = await fetchMonthlyStats(-1)
        const trendData = await fetchTrendData(30)

        // Calculate metrics
        const revenueTrendPercent = previousMonth.revenue > 0
          ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
          : 0

        const profitMargin = currentMonth.revenue > 0
          ? (currentMonth.profit / currentMonth.revenue) * 100
          : 0

        const expenseRatio = currentMonth.revenue > 0
          ? (currentMonth.expenses / currentMonth.revenue) * 100
          : 0

        // Calculate growth momentum (last 7 vs previous 7)
        const last7 = trendData.slice(0, 7).reduce((sum, d) => sum + d.revenue, 0)
        const prev7 = trendData.slice(7, 14).reduce((sum, d) => sum + d.revenue, 0)
        const growthMomentum = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0

        // Evaluate components
        const revenueTrendEval =
          revenueTrendPercent >= 20 ? 'ดีมาก ⬆️'
            : revenueTrendPercent >= 5 ? 'ดี ↗️'
            : revenueTrendPercent >= -5 ? 'ปานกลาง →'
            : 'ต้องปรับปรุง ⬇️'

        const expenseControlEval =
          expenseRatio <= 30 ? 'ดีมาก ✓'
            : expenseRatio <= 40 ? 'ดี'
            : expenseRatio <= 50 ? 'ปานกลาง'
            : 'ต้องปรับปรุง ⚠️'

        const profitMarginEval =
          profitMargin >= 30 ? 'ดีมาก ✓'
            : profitMargin >= 20 ? 'ดี'
            : profitMargin >= 10 ? 'ปานกลาง'
            : 'ต้องปรับปรุง ⚠️'

        const growthMomentumEval =
          growthMomentum >= 15 ? 'ดีมาก ⬆️'
            : growthMomentum >= 5 ? 'ดี ↗️'
            : growthMomentum >= -5 ? 'ปานกลาง →'
            : 'ต้องปรับปรุง ⬇️'

        // Calculate overall health score (0-100)
        let score = 0

        // Revenue Trend (20 points)
        if (revenueTrendPercent >= 20) score += 20
        else if (revenueTrendPercent >= 5) score += 15
        else if (revenueTrendPercent >= -5) score += 10
        else score += 5

        // Expense Control (20 points)
        if (expenseRatio <= 30) score += 20
        else if (expenseRatio <= 40) score += 15
        else if (expenseRatio <= 50) score += 10
        else score += 5

        // Profit Margin (30 points)
        if (profitMargin >= 30) score += 30
        else if (profitMargin >= 20) score += 20
        else if (profitMargin >= 10) score += 12
        else score += 5

        // Growth Momentum (30 points)
        if (growthMomentum >= 15) score += 30
        else if (growthMomentum >= 5) score += 20
        else if (growthMomentum >= -5) score += 12
        else score += 5

        setHealthData({
          score: Math.round(score),
          revenueTrend: revenueTrendEval,
          expenseControl: expenseControlEval,
          profitMargin: profitMarginEval,
          growthMomentum: growthMomentumEval,
        })
        setError(null)
      } catch (err) {
        console.error('Error calculating health score:', err)
        setError('ไม่สามารถคำนวณได้')
      } finally {
        setLoading(false)
      }
    }

    calculateHealth()
  }, [])

  if (error && !healthData) {
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
          กำลังคำนวณ...
        </CardContent>
      </Card>
    )
  }

  if (!healthData) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500 dark:text-gray-400">
          ไม่มีข้อมูล
        </CardContent>
      </Card>
    )
  }

  const score = healthData.score
  const scoreColor =
    score >= 80 ? 'from-green-500 to-emerald-500'
      : score >= 60 ? 'from-yellow-500 to-amber-500'
      : score >= 40 ? 'from-orange-500 to-red-500'
      : 'from-red-500 to-red-600'

  const scoreTextColor =
    score >= 80 ? 'text-green-600 dark:text-green-400'
      : score >= 60 ? 'text-yellow-600 dark:text-yellow-400'
      : score >= 40 ? 'text-orange-600 dark:text-orange-400'
      : 'text-red-600 dark:text-red-400'

  const stars = Math.round(score / 20)

  return (
    <Card>
      <CardContent className="py-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
          {title}
        </h3>

        {/* Score Display */}
        <div className={`bg-gradient-to-r ${scoreColor} rounded-xl p-6 text-white mb-6 text-center`}>
          <p className="text-sm font-medium opacity-90 mb-2">คะแนนสุขภาพธุรกิจ</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <p className="text-4xl font-bold">{score}</p>
            <p className="text-lg opacity-75">/100</p>
          </div>
          <p className="text-sm">
            {'⭐'.repeat(stars)}
            {stars < 5 && '☆'.repeat(5 - stars)}
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          <MetricItem
            label="เทรนด์รายได้"
            value={healthData.revenueTrend}
          />
          <MetricItem
            label="ควบคุมค่าใช้จ่าย"
            value={healthData.expenseControl}
          />
          <MetricItem
            label="ส่วนกำไร"
            value={healthData.profitMargin}
          />
          <MetricItem
            label="โมเมนตัมการเติบโต"
            value={healthData.growthMomentum}
          />
        </div>

        {/* Recommendation */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            คำแนะนำ
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {score >= 80
              ? '✓ ธุรกิจของคุณแข็งแรง ปรับปรุงต่อไป'
              : score >= 60
              ? '→ สถานะปกติ มีพื้นที่ให้ปรับปรุง'
              : score >= 40
              ? '! ต้องใส่ใจ ควรปรับกลยุทธ์'
              : '⚠️ วิกฤติ ต้องการการดำเนินการด่วน'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}
