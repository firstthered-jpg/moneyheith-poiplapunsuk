'use client'

import React from 'react'
import Header from '@/components/Header'
import DailyMetricsCard from '@/components/analytics/DailyMetricsCard'
import TrendChart from '@/components/analytics/TrendChart'
import { Card, CardContent } from '@/components/Card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DailyMetricsPage() {
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
            ยอดขายประจำวัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ดูรายละเอียดยอดขายและค่าใช้จ่ายของแต่ละวัน
          </p>
        </div>

        {/* Daily Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DailyMetricsCard daysBack={1} title="วันนี้" />
          <DailyMetricsCard daysBack={2} title="เมื่อวาน" />
          <DailyMetricsCard daysBack={3} title="2 วันก่อน" />
          <DailyMetricsCard daysBack={4} title="3 วันก่อน" />
          <DailyMetricsCard daysBack={5} title="4 วันก่อน" />
          <DailyMetricsCard daysBack={8} title="1 สัปดาห์ที่แล้ว" />
        </div>

        {/* Best and Worst Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                📈 วันที่ขายดีที่สุด
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ในช่วง 30 วันนี้
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ฿45,500
              </p>
              <p className="text-xs text-gray-500 mt-2">
                วันที่ 15 พฤษภาคม 2026
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                📉 วันที่ขายน้อยที่สุด
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ในช่วง 30 วันนี้
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ฿2,300
              </p>
              <p className="text-xs text-gray-500 mt-2">
                วันที่ 8 พฤษภาคม 2026
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <TrendChart daysBack={30} title="เทรนด์รายได้และค่าใช้จ่าย" />

        {/* Day of Week Analysis */}
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
              📅 วิเคราะห์ตามวันในสัปดาห์
            </h3>
            <div className="space-y-3">
              {[
                { day: 'จันทร์', avg: '฿4,200', count: 4 },
                { day: 'อังคาร', avg: '฿5,100', count: 4 },
                { day: 'พุธ', avg: '฿4,800', count: 4 },
                { day: 'พฤหัส', avg: '฿6,300', count: 4 },
                { day: 'ศุกร์', avg: '฿7,200', count: 4 },
                { day: 'เสาร์', avg: '฿8,100', count: 4 },
                { day: 'อาทิตย์', avg: '฿5,900', count: 4 },
              ].map((item) => (
                <div
                  key={item.day}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.day}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.count} วัน
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {item.avg}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
