'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import type { DailyCost } from '@/lib/types'

export default function DailyCostPage() {
  const {
    fetchTransactions,
    addDailyCost,
    addPaymentToDailyCost,
    removePaymentFromDailyCost,
    deleteTransaction,
    getDailyCosts,
  } = useFinanceStore()

  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchTransactions()
      setIsLoading(false)
    }
    load()
  }, [fetchTransactions])

  const dailyCosts = getDailyCosts()
  const today = new Date().toISOString().split('T')[0]

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || value <= 0) return
    setIsSubmitting(true)
    try {
      await addDailyCost({
        date: new Date(date),
        amount: value,
        description,
      })
      setAmount('')
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            ต้นทุนรายวัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            บันทึกยอดต้นทุนรวมของแต่ละวัน และเก็บการจ่ายเงินจริงระหว่างวันได้
          </p>
        </div>

        {/* Add daily cost */}
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มต้นทุนวันใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    วันที่
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    ต้นทุนรวมของวันนี้
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
                  placeholder="เช่น ของสด ของแห้ง"
                />
              </div>
              <Button variant="primary" fullWidth type="submit" isLoading={isSubmitting}>
                บันทึกต้นทุน
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Daily cost list */}
        <Card>
          <CardHeader>
            <CardTitle>รายการต้นทุน</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-gray-500 py-6">
                กำลังโหลดข้อมูล...
              </div>
            ) : dailyCosts.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                ยังไม่มีรายการ
              </div>
            ) : (
              <div className="space-y-3">
                {dailyCosts.map((dc) => (
                  <DailyCostCard
                    key={dc.id}
                    dc={dc}
                    isOpen={expanded.has(dc.id)}
                    onToggle={() => toggleExpanded(dc.id)}
                    onAddPayment={(payment) => addPaymentToDailyCost(dc.id, payment)}
                    onRemovePayment={(pid) => removePaymentFromDailyCost(dc.id, pid)}
                    onDeleteCost={() => deleteTransaction(dc.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

interface DailyCostCardProps {
  dc: DailyCost
  isOpen: boolean
  onToggle: () => void
  onAddPayment: (payment: { amount: number; description?: string; paid_at: string }) => Promise<void>
  onRemovePayment: (paymentId: string) => Promise<void>
  onDeleteCost: () => Promise<void>
}

function DailyCostCard({
  dc,
  isOpen,
  onToggle,
  onAddPayment,
  onRemovePayment,
  onDeleteCost,
}: DailyCostCardProps) {
  const [payAmount, setPayAmount] = useState('')
  const [payNote, setPayNote] = useState('')
  const [busy, setBusy] = useState(false)

  const paid = useMemo(
    () => dc.payments.reduce((sum, p) => sum + p.amount, 0),
    [dc.payments]
  )
  const remaining = dc.amount - paid

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(payAmount)
    if (!value || value <= 0) return
    setBusy(true)
    try {
      await onAddPayment({
        amount: value,
        description: payNote,
        paid_at: new Date().toISOString(),
      })
      setPayAmount('')
      setPayNote('')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteCost = async () => {
    if (!confirm('ลบรายการต้นทุนวันนี้ทั้งหมด?')) return
    setBusy(true)
    try {
      await onDeleteCost()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black dark:text-white">
            {formatDate(dc.date)}
          </p>
          {dc.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {dc.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-600 dark:text-gray-400">ต้นทุนรวม</p>
            <p className="font-bold text-black dark:text-white">
              {formatCurrency(dc.amount)}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-600 dark:text-gray-400">จ่ายแล้ว</p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(paid)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 dark:text-gray-400">คงเหลือ</p>
            <p
              className={`font-bold ${
                remaining > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {formatCurrency(remaining)}
            </p>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/40">
          {/* Payments list */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-black dark:text-white">
              ต้นทุนที่จ่ายไปแล้ว
            </h4>
            {dc.payments.length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีการจ่าย</p>
            ) : (
              dc.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md px-3 py-2 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-black dark:text-white">
                      {formatCurrency(p.amount)}
                    </p>
                    {p.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemovePayment(p.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    aria-label="ลบรายการจ่าย"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add payment form */}
          <form
            onSubmit={handleAddPayment}
            className="grid grid-cols-12 gap-2 items-end"
          >
            <div className="col-span-5 sm:col-span-4">
              <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                จำนวนที่จ่าย
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">฿</span>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="input pl-7 text-sm py-2 w-full"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="col-span-7 sm:col-span-6">
              <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                หมายเหตุ
              </label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="input text-sm py-2 w-full"
                placeholder="เช่น จ่ายเงินสด"
              />
            </div>
            <div className="col-span-12 sm:col-span-2">
              <Button
                type="submit"
                variant="success"
                fullWidth
                size="sm"
                isLoading={busy}
              >
                <Plus size={14} />
                บันทึก
              </Button>
            </div>
          </form>

          {/* Delete daily cost */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDeleteCost}
              disabled={busy}
              className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              ลบต้นทุนของวันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
