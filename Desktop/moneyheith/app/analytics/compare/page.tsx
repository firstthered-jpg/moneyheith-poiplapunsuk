'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import MonthCompare from '@/components/analytics/MonthCompare'
import { Card, CardContent } from '@/components/Card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ComparePage() {
  const [selectedMonth1, setSelectedMonth1] = useState(0)
  const [selectedMonth2, setSelectedMonth2] = useState(-1)

  // Get month names
  const getMonthName = (offset: number) => {
    const date = new Date()
    date.setMonth(date.getMonth() + offset)
    return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6">
        {/* Back Button */}
        <Link
          href="/analytics"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">กลับไปแดชบอร์ด</span>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            เปรียบเทียบเดือน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            เปรียบเทียบยอดขายและค่าใช้จ่ายระหว่างเดือนต่างๆ
          </p>
        </div>

        {/* Month Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                เดือนแรก
              </label>
              <select
                value={selectedMonth1}
                onChange={(e) => setSelectedMonth1(Number(e.target.value))}
                className="input w-full"
              >
                {[0, -1, -2, -3, -4, -5, -6].map((offset) => (
                  <option key={offset} value={offset}>
                    {getMonthName(offset)}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                เดือนที่สอง
              </label>
              <select
                value={selectedMonth2}
                onChange={(e) => setSelectedMonth2(Number(e.target.value))}
                className="input w-full"
              >
                {[0, -1, -2, -3, -4, -5, -6].map((offset) => (
                  <option key={offset} value={offset}>
                    {getMonthName(offset)}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Comparison */}
        <MonthCompare
          month1Offset={selectedMonth1}
          month2Offset={selectedMonth2}
          title={`เปรียบเทียบ ${getMonthName(selectedMonth1)} vs ${getMonthName(selectedMonth2)}`}
        />

        {/* Quick Comparisons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              เดือนนี้ vs เดือนที่แล้ว
            </h3>
            <MonthCompare month1Offset={0} month2Offset={-1} title="" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              เดือนนี้ vs ปีที่แล้ว
            </h3>
            <MonthCompare month1Offset={0} month2Offset={-12} title="" />
          </div>
        </div>

        {/* Insights */}
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              💡 ข้อมูลเชิงลึก
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>รายได้เดือนนี้เพิ่มขึ้น 25% เมื่อเทียบกับเดือนที่แล้ว</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 dark:text-yellow-400">!</span>
                <span>ค่าใช้จ่ายลดลง 15% แต่ส่วนกำไรเพิ่มขึ้น 42%</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>จำนวนรายการเพิ่มขึ้น แต่ค่าเฉลี่ยต่อรายการยังคงเดิม</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
