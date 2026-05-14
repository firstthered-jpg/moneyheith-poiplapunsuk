'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import TrendChart from '@/components/analytics/TrendChart'
import { Card, CardContent } from '@/components/Card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TrendsPage() {
  const [period, setPeriod] = useState<7 | 14 | 30 | 90>(30)

  const periodLabel = {
    7: '7 วัน',
    14: '14 วัน',
    30: '30 วัน',
    90: '90 วัน',
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
            วิเคราะห์เทรนด์
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ตรวจสอบแนวโน้มรายได้และค่าใช้จ่ายของคุณ
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-2">
          {([7, 14, 30, 90] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                period === p
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>

        {/* Trend Chart */}
        <TrendChart daysBack={period} title={`เทรนด์รายได้และค่าใช้จ่าย (${periodLabel[period]})`} />

        {/* Trend Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                📈 แนวโน้มรายได้
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ค่าเฉลี่ย
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ฿5,200
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    สูงสุด
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ฿12,500
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ต่ำสุด
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    ฿1,800
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ความเสถียร
                    </span>
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      ปานกลาง ↗️
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                💸 แนวโน้มค่าใช้จ่าย
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ค่าเฉลี่ย
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ฿1,800
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    สูงสุด
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    ฿3,200
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ต่ำสุด
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ฿500
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ควบคุม
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      ดี ✓
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Patterns */}
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              🔄 รูปแบบการเติบโต
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">
                  ✓
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    แนวโน้มบวก
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    รายได้ขึ้นแนวโน้มในช่วง 2 สัปดาห์ที่ผ่านมา เพิ่มขึ้น 18%
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold mt-0.5">
                  !
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    ประเด็นสังเกต
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    ค่าใช้จ่ายมีความผันผวน โดยเฉพาะในการจัดซื้อจำนวนมากช่วงกลางเดือน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                  →
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    ข้อเสนอแนะ
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    พิจารณาวางแผนค่าใช้จ่ายปีตามเทรนด์เพื่อให้มีความสม่ำเสมอมากขึ้น
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moving Averages */}
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              📊 ค่าเฉลี่ยเคลื่อนที่
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ค่าเฉลี่ย 7 วัน (รายได้)
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ฿5,600
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ค่าเฉลี่ย 14 วัน (รายได้)
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ฿5,200
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ค่าเฉลี่ย 7 วัน (ค่าใช้จ่าย)
                </span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  ฿1,900
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ค่าเฉลี่ย 14 วัน (ค่าใช้จ่าย)
                </span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  ฿1,800
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
