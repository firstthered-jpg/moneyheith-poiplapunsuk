'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

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
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [date, setDate] = useState(
    transaction?.date
      ? new Date(transaction.date).toISOString().split('T')[0]
      : ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount?.toString() || '')
      setDescription(transaction.description || '')
      setDate(
        transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : ''
      )
      setError('')
    }
  }, [transaction])

  if (!isOpen || !transaction) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const value = parseFloat(amount)
    if (!value || isNaN(value)) {
      setError('กรุณาใส่จำนวนเงินที่ถูกต้อง')
      return
    }
    if (!date) {
      setError('กรุณาเลือกวันที่')
      return
    }

    try {
      setIsLoading(true)
      await onSave({
        amount: value,
        description,
        date: new Date(date),
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

          <form onSubmit={handleSave} className="p-6 space-y-4">
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                จำนวนเงิน
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">฿</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input pl-8 w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

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

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

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
