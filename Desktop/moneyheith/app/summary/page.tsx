'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency } from '@/lib/utils'

export default function SummaryPage() {
  const {
    fetchTransactions,
    addMonthlyRevenueItem,
    removeMonthlyRevenueItem,
    getMonthlyRevenueItems,
    getMonthlyRevenue,
    setMonthlyAds,
    getMonthlyAds,
    getMonthlySummary,
  } = useFinanceStore()

  const now = new Date()
  const [isLoading, setIsLoading] = useState(true)
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const [revenueName, setRevenueName] = useState('')
  const [revenueAmount, setRevenueAmount] = useState('')
  const [adsInput, setAdsInput] = useState('')
  const [isSavingRevenue, setIsSavingRevenue] = useState(false)
  const [isSavingAds, setIsSavingAds] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const [year, monthNum] = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    return [y, m]
  }, [month])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchTransactions()
      setIsLoading(false)
    }
    load()
  }, [fetchTransactions])

  useEffect(() => {
    if (isLoading) return
    const ads = getMonthlyAds(year, monthNum)
    setAdsInput(ads ? String(ads) : '')
  }, [year, monthNum, isLoading, getMonthlyAds])

  const revenueItems = getMonthlyRevenueItems(year, monthNum)
  const summary = getMonthlySummary(year, monthNum)
  const monthLabel = useMemo(
    () =>
      new Date(year, monthNum - 1, 1).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
      }),
    [year, monthNum]
  )

  const handleAddRevenue = async () => {
    const name = revenueName.trim()
    const amount = parseFloat(revenueAmount) || 0
    if (!name || amount <= 0) return

    setIsSavingRevenue(true)
    try {
      await addMonthlyRevenueItem(year, monthNum, name, amount)
      setRevenueName('')
      setRevenueAmount('')
    } finally {
      setIsSavingRevenue(false)
    }
  }

  const handleRemoveRevenue = async (id: string) => {
    setRemovingId(id)
    try {
      await removeMonthlyRevenueItem(id)
    } finally {
      setRemovingId(null)
    }
  }

  const handleSaveAds = async () => {
    const v = parseFloat(adsInput) || 0
    setIsSavingAds(true)
    try {
      await setMonthlyAds(year, monthNum, v)
    } finally {
      setIsSavingAds(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 max-w-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              สรุปยอด {monthLabel}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              คำนวณยอดสุทธิร้านและเงินคงเหลือหลังหักรายจ่ายในบ้าน
            </p>
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-auto"
          />
        </div>

        {/* Revenue Items */}
        <Card>
          <CardHeader>
            <CardTitle>ยอดรายรับรวมของเดือน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-500 py-4">
                กำลังโหลดข้อมูล...
              </div>
            ) : (
              <>
                {/* Revenue Items List */}
                {revenueItems.length > 0 && (
                  <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {revenueItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm text-black dark:text-white">
                            {item.description || '(ไม่มีชื่อ)'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveRevenue(item.id)}
                          disabled={removingId === item.id}
                          className="ml-3 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {removingId === item.id ? 'ลบ...' : 'ลบ'}
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-semibold text-black dark:text-white">
                      <span>รวมทั้งหมด</span>
                      <span>{formatCurrency(summary.revenue)}</span>
                    </div>
                  </div>
                )}

                {/* Add Revenue Item */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ชื่อรายรับ
                    </label>
                    <input
                      type="text"
                      value={revenueName}
                      onChange={(e) => setRevenueName(e.target.value)}
                      placeholder="เช่น ยอดขายร้าน, รายได้เพิ่มเติม"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      จำนวนเงิน
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">฿</span>
                      <input
                        type="number"
                        value={revenueAmount}
                        onChange={(e) => setRevenueAmount(e.target.value)}
                        className="input pl-8 w-full"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleAddRevenue}
                    isLoading={isSavingRevenue}
                    disabled={!revenueName.trim() || !revenueAmount}
                  >
                    เพิ่มรายรับ
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ads */}
        <Card>
          <CardHeader>
            <CardTitle>ค่าโฆษณาของเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">฿</span>
                <input
                  type="number"
                  value={adsInput}
                  onChange={(e) => setAdsInput(e.target.value)}
                  className="input pl-8"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSaveAds}
                isLoading={isSavingAds}
              >
                บันทึกค่าโฆษณา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calculation */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle>คำนวณยอดสุทธิ</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-gray-500 py-4">
                กำลังโหลดข้อมูล...
              </div>
            ) : (
              <div className="space-y-3">
                <SummaryRow
                  label="ยอดรายรับรวม"
                  value={summary.revenue}
                  sign="+"
                  color="text-green-600 dark:text-green-400"
                />
                <SummaryRow
                  label="ต้นทุนรายวันรวมทั้งเดือน"
                  value={summary.totalDailyCost}
                  sign="-"
                  color="text-red-600 dark:text-red-400"
                />
                <SummaryRow
                  label="ค่าโฆษณา"
                  value={summary.ads}
                  sign="-"
                  color="text-red-600 dark:text-red-400"
                />
                <div className="flex justify-between pt-3 mt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-semibold text-black dark:text-white">
                    {summary.storeNet >= 0 ? 'ยอดสุทธิร้าน' : 'ขาดทุนสุทธิร้าน'}
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      summary.storeNet >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(Math.abs(summary.storeNet))}
                  </span>
                </div>

                <div className="pt-3 mt-2 border-t border-blue-200 dark:border-blue-800 space-y-3">
                  <SummaryRow
                    label="รายจ่ายในบ้านรวมทั้งเดือน"
                    value={summary.totalHousehold}
                    sign="-"
                    color="text-orange-600 dark:text-orange-400"
                  />
                  <div className="flex justify-between pt-3 mt-2 border-t-2 border-blue-300 dark:border-blue-700">
                    <span className="font-bold text-black dark:text-white">
                      {summary.remaining >= 0 ? 'เงินคงเหลือสุทธิ' : 'ขาดทุนคงเหลือ'}
                    </span>
                    <span
                      className={`text-2xl font-extrabold ${
                        summary.remaining >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(summary.remaining))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  sign,
  color,
}: {
  label: string
  value: number
  sign: '+' | '-'
  color: string
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`font-semibold ${color}`}>
        {sign}
        {formatCurrency(value)}
      </span>
    </div>
  )
}
