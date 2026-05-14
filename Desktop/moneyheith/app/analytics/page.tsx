'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import DailyMetricsCard from '@/components/analytics/DailyMetricsCard'
import ExpenseBreakdown from '@/components/analytics/ExpenseBreakdown'
import MonthCompare from '@/components/analytics/MonthCompare'
import TrendChart from '@/components/analytics/TrendChart'
import HealthScore from '@/components/analytics/HealthScore'
import { ChevronRight } from 'lucide-react'

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<'day' | 'month'>('month')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            วิเคราะห์ยอดขาย
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            มองเห็นรายได้ ค่าใช้จ่าย และกำไรของร้านของคุณ
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/analytics/daily-metrics"
            className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ยอดประจำวัน
              </p>
              <p className="text-lg font-bold text-black dark:text-white mt-1">
                ดูรายละเอียด
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>

          <Link
            href="/analytics/compare"
            className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                เปรียบเทียบ
              </p>
              <p className="text-lg font-bold text-black dark:text-white mt-1">
                เดือนต่างๆ
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>

          <Link
            href="/analytics/trends"
            className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                เทรนด์
              </p>
              <p className="text-lg font-bold text-black dark:text-white mt-1">
                30 วันนี้
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </div>

        {/* Health Score */}
        <HealthScore />

        {/* Daily Metrics */}
        <DailyMetricsCard daysBack={1} title="วันนี้" />

        {/* Previous Day for Comparison */}
        <DailyMetricsCard daysBack={2} title="เมื่อวาน" />

        {/* Trends */}
        <TrendChart daysBack={30} title="เทรนด์รายได้และค่าใช้จ่าย (30 วัน)" />

        {/* Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthCompare month1Offset={0} month2Offset={-1} title="เปรียบเทียบเดือน" />
          </div>
          <div>
            <ExpenseBreakdown monthOffset={0} title="ค่าใช้จ่ายประจำเดือน" />
          </div>
        </div>

        {/* Previous Month Breakdown */}
        <ExpenseBreakdown monthOffset={-1} title="ค่าใช้จ่ายเดือนที่แล้ว" />
      </main>
    </div>
  )
}
