'use client'

import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants'
import { formatDate, generateId } from '@/lib/utils'

interface DailyIncome {
  id: string
  category: string
  amount: string
  description: string
}

interface EditTransactionModalProps {
  isOpen: boolean
  transaction: any
  onClose: () => void
  onSave: (updates: any) => Promise<void>
}

export default function EditTransactionModal({
  isOpen,
  transaction,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  const isIncomeType = transaction?.type === 'income'

  const [incomes, setIncomes] = useState<DailyIncome[]>(
    isIncomeType
      ? [
          {
            id: transaction?.id || generateId(),
            category: transaction?.category || '',
            amount: transaction?.amount.toString() || '',
            description: transaction?.description || '',
          },
        ]
      : []
  )

  const [amount, setAmount] = useState(
    !isIncomeType ? (transaction?.amount.toString() || '') : ''
  )
  const [category, setCategory] = useState(
    !isIncomeType ? (transaction?.category || '') : ''
  )
  const [description, setDescription] = useState(
    !isIncomeType ? (transaction?.description || '') : ''
  )
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !transaction) return null

  const categories =
    transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const addIncomeRow = () =>
    setIncomes([
      ...incomes,
      {
        id: generateId(),
        category: INCOME_CATEGORIES[0].name,
        amount: '',
        description: '',
      },
    ])

  const updateIncome = (id: string, patch: Partial<DailyIncome>) =>
    setIncomes(incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const removeIncome = (id: string) =>
    setIncomes(incomes.filter((i) => i.id !== id))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isIncomeType) {
      // Validate incomes
      const totalIncome = incomes.reduce(
        (sum, i) => sum + (parseFloat(i.amount) || 0),
        0
      )

      if (totalIncome <= 0) {
        setError('กรุณาใส่จำนวนเงินที่มากกว่า 0')
        return
      }

      if (incomes.some((i) => !i.category)) {
        setError('กรุณาเลือกหมวดหมู่สำหรับรายการทั้งหมด')
        return
      }

      if (!date) {
        setError('กรุณาเลือกวันที่')
        return
      }

      try {
        setIsLoading(true)
        const txDate = new Date(date)

        // Return all income items for processing
        await onSave({
          incomes: incomes.map((inc) => ({
            amount: Number(inc.amount),
            category: inc.category,
            description: inc.description || `รายรับ • ${inc.category}`,
            date: txDate.toISOString(),
          })),
          isMultiple: incomes.length > 1,
        })
        onClose()
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาด')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Expense type - original logic
      if (!amount || isNaN(Number(amount))) {
        setError('กรุณาใส่จำนวนเงินที่ถูกต้อง')
        return
      }

      if (!category) {
        setError('กรุณาเลือกหมวดหมู่')
        return
      }

      if (!date) {
        setError('กรุณาเลือกวันที่')
        return
      }

      try {
        setIsLoading(true)
        await onSave({
          amount: Number(amount),
          category,
          description,
          date: new Date(date).toISOString(),
        })
        onClose()
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาด')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-white">
              แก้ไขรายการ
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Type Badge */}
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  transaction.type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}
              >
                {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
              </span>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input w-full"
              />
            </div>

            {isIncomeType ? (
              <>
                {/* Multiple Income Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      รายรับ
                    </label>
                    <button
                      type="button"
                      onClick={addIncomeRow}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus size={16} /> เพิ่มรายรับ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {incomes.map((inc, idx) => (
                      <div
                        key={inc.id}
                        className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="col-span-12 sm:col-span-4">
                          <select
                            value={inc.category}
                            onChange={(e) =>
                              updateIncome(inc.id, { category: e.target.value })
                            }
                            className="input w-full text-sm"
                          >
                            <option value="">เลือกหมวดหมู่</option>
                            {INCOME_CATEGORIES.map((cat) => (
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
                              value={inc.amount}
                              onChange={(e) =>
                                updateIncome(inc.id, { amount: e.target.value })
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
                            value={inc.description}
                            onChange={(e) =>
                              updateIncome(inc.id, { description: e.target.value })
                            }
                            className="input text-sm py-2"
                            placeholder="รายละเอียด"
                          />
                        </div>
                        {incomes.length > 1 && (
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeIncome(inc.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              aria-label={`ลบรายการที่ ${idx + 1}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    จำนวนเงิน
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    หมวดหมู่
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Description - Only for expenses */}
            {!isIncomeType && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input w-full resize-none h-24"
                  placeholder="เพิ่มหมายเหตุ (ไม่จำเป็น)"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
