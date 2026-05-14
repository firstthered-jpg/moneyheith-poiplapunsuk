'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { useFinanceStore } from '@/lib/store-supabase'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

export default function ExpensePage() {
  const router = useRouter()
  const { addTransaction } = useFinanceStore()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || value <= 0) return

    addTransaction({
      type: 'expense',
      amount: value,
      category,
      description,
      date: new Date(date),
    })

    router.push('/history')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">บันทึกรายจ่าย</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            เพิ่มรายการรายจ่ายใหม่
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดรายจ่าย</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  หมวดหมู่
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        category === cat.name
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
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

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  รายละเอียด
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="เช่น ค่าอาหาร, ค่าเดินทาง..."
                />
              </div>

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

              <Button variant="danger" fullWidth type="submit">
                บันทึกรายจ่าย
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
