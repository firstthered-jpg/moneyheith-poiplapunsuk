'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { useFinanceStore } from '@/lib/store-supabase'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants'
import { formatCurrency, generateId } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface DailyExpense {
  id: string
  category: string
  amount: string
  description: string
}

export default function IncomePage() {
  const router = useRouter()
  const { addTransaction } = useFinanceStore()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(INCOME_CATEGORIES[0].name)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [expenses, setExpenses] = useState<DailyExpense[]>([])

  const addExpenseRow = () =>
    setExpenses([
      ...expenses,
      {
        id: generateId(),
        category: EXPENSE_CATEGORIES[0].name,
        amount: '',
        description: '',
      },
    ])

  const updateExpense = (id: string, patch: Partial<DailyExpense>) =>
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const removeExpense = (id: string) =>
    setExpenses(expenses.filter((e) => e.id !== id))

  const totalExpense = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  )
  const grossIncome = parseFloat(amount) || 0
  const netProfit = grossIncome - totalExpense

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (grossIncome <= 0) return

    const txDate = new Date(date)
    addTransaction({
      type: 'income',
      amount: grossIncome,
      category,
      description,
      date: txDate,
    })

    expenses.forEach((exp) => {
      const value = parseFloat(exp.amount) || 0
      if (value > 0) {
        addTransaction({
          type: 'expense',
          amount: value,
          category: exp.category,
          description: exp.description || `ค่าใช้จ่ายระหว่างวัน • ${exp.category}`,
          date: txDate,
        })
      }
    })

    router.push('/history')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            บันทึกรายรับ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            บันทึกยอดขายและค่าใช้จ่ายระหว่างวัน
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Income card */}
          <Card>
            <CardHeader>
              <CardTitle>ยอดขาย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-3">
                  ช่องทางการขาย
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INCOME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        category === cat.name
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
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
                    className="input pl-8 text-lg font-semibold"
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
                  placeholder="เช่น ยอดขายวันเสาร์, ขายผ่าน Shopee..."
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
            </CardContent>
          </Card>

          {/* Daily expenses card */}
          <Card>
            <CardHeader className="flex-between">
              <div>
                <CardTitle>ค่าใช้จ่ายระหว่างวัน</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  รายการค่าใช้จ่ายที่เกิดขึ้นในวันเดียวกัน เช่น ต้นทุนสินค้า ค่าจัดส่ง
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={addExpenseRow}
              >
                <Plus size={16} />
                เพิ่มรายการ
              </Button>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <button
                  type="button"
                  onClick={addExpenseRow}
                  className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + เพิ่มค่าใช้จ่ายระหว่างวัน (ถ้ามี)
                </button>
              ) : (
                <div className="space-y-3">
                  {expenses.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <select
                          value={exp.category}
                          onChange={(e) =>
                            updateExpense(exp.id, { category: e.target.value })
                          }
                          className="select w-full text-sm"
                        >
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-7 sm:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500 text-sm">
                            ฿
                          </span>
                          <input
                            type="number"
                            value={exp.amount}
                            onChange={(e) =>
                              updateExpense(exp.id, { amount: e.target.value })
                            }
                            className="input pl-7 text-sm py-2"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-4">
                        <input
                          type="text"
                          value={exp.description}
                          onChange={(e) =>
                            updateExpense(exp.id, { description: e.target.value })
                          }
                          className="input text-sm py-2"
                          placeholder="รายละเอียด"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeExpense(exp.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label={`ลบรายการที่ ${idx + 1}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-900">
            <CardContent className="py-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ยอดขาย</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(grossIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    ค่าใช้จ่ายระหว่างวัน
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(totalExpense)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-semibold text-black dark:text-white">
                    {netProfit >= 0 ? 'กำไรสุทธิวันนี้' : 'ขาดทุนสุทธิวันนี้'}
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      netProfit >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="success" fullWidth type="submit">
            บันทึกรายรับ
          </Button>
        </form>
      </main>
    </div>
  )
}
