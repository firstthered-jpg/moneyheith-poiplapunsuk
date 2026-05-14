'use client'

import React, { useState, useMemo } from 'react'
import Header from '@/components/Header'
import { Card, CardContent } from '@/components/Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Trash2, ChevronDown } from 'lucide-react'

const typeLabel: Record<'all' | 'income' | 'expense', string> = {
  all: 'ทั้งหมด',
  income: 'รายรับ',
  expense: 'รายจ่าย',
}

const sortLabel: Record<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category', string> = {
  'date-desc': 'วันที่ (ล่าสุด)',
  'date-asc': 'วันที่ (เก่าสุด)',
  'amount-desc': 'จำนวนเงิน (มากสุด)',
  'amount-asc': 'จำนวนเงิน (น้อยสุด)',
  category: 'หมวดหมู่',
}

const groupLabel: Record<'list' | 'day' | 'month' | 'year', string> = {
  list: 'รายการ',
  day: 'รายวัน',
  month: 'รายเดือน',
  year: 'รายปี',
}

export default function HistoryPage() {
  const { transactions, deleteTransaction } = useFinanceStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category'>('date-desc')
  const [groupBy, setGroupBy] = useState<'list' | 'day' | 'month' | 'year'>('list')

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    let result = transactions.filter((t) => {
      const matchesSearch =
        (t.description || '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      const matchesType = filterType === 'all' || t.type === filterType
      return matchesSearch && matchesType
    })

    // Apply sorting
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case 'amount-desc':
        result.sort((a, b) => b.amount - a.amount)
        break
      case 'amount-asc':
        result.sort((a, b) => a.amount - b.amount)
        break
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category, 'th'))
        break
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    return result
  }, [transactions, searchQuery, filterType, sortBy])

  // Group transactions
  const grouped = useMemo(() => {
    if (groupBy === 'list') {
      return null
    }

    const groups: Record<string, typeof filtered> = {}

    filtered.forEach((transaction) => {
      const date = new Date(transaction.date)
      let key: string

      switch (groupBy) {
        case 'day':
          key = date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
          break
        case 'month':
          key = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
          break
        case 'year':
          key = date.getFullYear().toString()
          break
        default:
          key = 'other'
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(transaction)
    })

    return groups
  }, [filtered, groupBy])

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            ประวัติรายการ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ดูและจัดการรายการทั้งหมด
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">รายรับ</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">รายจ่าย</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">คงเหลือ</p>
              <p
                className={`text-lg font-bold ${
                  totalIncome - totalExpense >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Controls */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Search & Type Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="ค้นหาตามรายละเอียดหรือหมวดหมู่..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'income', 'expense'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      filterType === type
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {typeLabel[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & Group Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Group By */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                  จัดกลุ่มตาม
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                  className="input text-sm w-full"
                >
                  {(['list', 'day', 'month', 'year'] as const).map((group) => (
                    <option key={group} value={group}>
                      {groupLabel[group]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                  เรียงลำดับตาม
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input text-sm w-full"
                >
                  {(['date-desc', 'date-asc', 'amount-desc', 'amount-asc', 'category'] as const).map((sort) => (
                    <option key={sort} value={sort}>
                      {sortLabel[sort]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardContent>
            {filtered.length > 0 ? (
              <div>
                {groupBy === 'list' ? (
                  // List view
                  <div className="divide-y divide-border-light dark:divide-gray-800">
                    {filtered.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        onDelete={() => deleteTransaction(transaction.id)}
                      />
                    ))}
                  </div>
                ) : (
                  // Grouped view
                  <div className="space-y-6">
                    {Object.entries(grouped || {})
                      .sort(([keyA], [keyB]) => {
                        // Sort groups
                        if (groupBy === 'year' || groupBy === 'month') {
                          return keyB.localeCompare(keyA, 'th')
                        }
                        return keyB.localeCompare(keyA)
                      })
                      .map(([groupKey, items]) => {
                        const groupIncome = items
                          .filter((t) => t.type === 'income')
                          .reduce((s, t) => s + t.amount, 0)
                        const groupExpense = items
                          .filter((t) => t.type === 'expense')
                          .reduce((s, t) => s + t.amount, 0)
                        const groupProfit = groupIncome - groupExpense

                        return (
                          <div key={groupKey} className="border-l-4 border-primary-400 dark:border-primary-500 pl-4">
                            {/* Group Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                              <h3 className="text-lg font-semibold text-black dark:text-white">
                                {groupKey}
                              </h3>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">รายรับ</p>
                                  <p className="font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(groupIncome)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">รายจ่าย</p>
                                  <p className="font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(groupExpense)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">สุทธิ</p>
                                  <p
                                    className={`font-bold ${
                                      groupProfit >= 0
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {formatCurrency(groupProfit)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Group Items */}
                            <div className="divide-y divide-border-light dark:divide-gray-800">
                              {items.map((transaction) => (
                                <TransactionRow
                                  key={transaction.id}
                                  transaction={transaction}
                                  onDelete={() => deleteTransaction(transaction.id)}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                ไม่พบรายการ
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: any
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between py-4 group">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-black dark:text-white truncate">
          {transaction.description || transaction.category}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(new Date(transaction.date))} • {transaction.category}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-base sm:text-lg font-bold ${
            transaction.type === 'income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </span>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="ลบรายการ"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
