'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { useFinanceStore } from '@/lib/store-supabase'
import { HOUSEHOLD_CATEGORIES } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export default function HouseholdPage() {
  const {
    fetchTransactions,
    addHouseholdExpense,
    deleteTransaction,
    getHouseholdExpenses,
  } = useFinanceStore()

  const today = new Date()
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState(today.toISOString().split('T')[0])
  const [category, setCategory] = useState(HOUSEHOLD_CATEGORIES[0].name)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterMonth, setFilterMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  )

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchTransactions()
      setIsLoading(false)
    }
    load()
  }, [fetchTransactions])

  const [filterYear, filterMonthNum] = useMemo(() => {
    const [y, m] = filterMonth.split('-').map(Number)
    return [y, m]
  }, [filterMonth])

  const expenses = getHouseholdExpenses(filterYear, filterMonthNum)
  const totalMonth = expenses.reduce((sum, e) => sum + e.amount, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || value <= 0) return
    setIsSubmitting(true)
    try {
      await addHouseholdExpense({
        date: new Date(date),
        category,
        amount: value,
        description,
      })
      setAmount('')
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบรายการนี้?')) return
    await deleteTransaction(id)
  }

  // Group by category for summary
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [expenses])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            รายจ่ายในบ้าน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            บันทึกรายจ่ายภายในบ้าน — ยอดรวมรายเดือนจะถูกหักจากยอดสุทธิร้านในหน้าสรุปยอด
          </p>
        </div>

        {/* Add form */}
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มรายจ่ายในบ้าน</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  หมวดหมู่
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HOUSEHOLD_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        category === cat.name
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-medium text-black dark:text-white">
                        {cat.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    วันที่
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    จำนวนเงิน
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">฿</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input pl-8"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  รายละเอียด (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="เช่น ค่าข้าวกับข้าว"
                />
              </div>

              <Button variant="primary" fullWidth type="submit" isLoading={isSubmitting}>
                บันทึกรายจ่าย
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Month filter + summary */}
        <Card>
          <CardHeader className="flex-between">
            <div>
              <CardTitle>รายการในเดือน</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                รวมเดือนนี้ {formatCurrency(totalMonth)}
              </p>
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="input text-sm py-1.5 w-auto"
            />
          </CardHeader>
          <CardContent>
            {byCategory.length > 0 && (
              <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {byCategory.map(([cat, sum]) => {
                  const meta = HOUSEHOLD_CATEGORIES.find((c) => c.name === cat)
                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                    >
                      <span className="text-xl">{meta?.icon || '📌'}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {cat}
                        </p>
                        <p className="text-sm font-semibold text-black dark:text-white">
                          {formatCurrency(sum)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {isLoading ? (
              <div className="text-center text-gray-500 py-6">
                กำลังโหลดข้อมูล...
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                ไม่มีรายการในเดือนนี้
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => {
                  const meta = HOUSEHOLD_CATEGORIES.find((c) => c.name === e.category)
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl">{meta?.icon || '📌'}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-black dark:text-white">
                            {e.category}
                          </p>
                          {e.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {e.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(e.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-red-600 dark:text-red-400">
                          -{formatCurrency(e.amount)}
                        </p>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          aria-label="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
