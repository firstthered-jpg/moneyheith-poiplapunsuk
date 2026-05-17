'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate, categoryLabel, kindOfCategory, type TxKind } from '@/lib/utils'
import { Search, Trash2, ChevronDown, Edit2 } from 'lucide-react'
import EditTransactionModal from '@/components/EditTransactionModal'

const kindLabel: Record<TxKind, string> = {
  all: 'ทั้งหมด',
  daily_cost: 'ต้นทุนรายวัน',
  household: 'รายจ่ายในบ้าน',
  monthly_revenue: 'รายรับ',
  monthly_ads: 'ค่าโฆษณา',
  other: 'อื่นๆ',
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

export default function HistoryContent() {
  const { transactions, deleteTransaction, updateTransaction, fetchTransactions } =
    useFinanceStore()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterKind, setFilterKind] = useState<TxKind>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category'>('date-desc')
  const [groupBy, setGroupBy] = useState<'list' | 'day' | 'month' | 'year'>('list')
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroupExpanded = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    let result = transactions.filter((t) => {
      const label = categoryLabel(t.category).toLowerCase()
      const matchesSearch =
        (t.description || '').toLowerCase().includes(q) || label.includes(q)
      const kind = kindOfCategory(t.category)
      const matchesKind = filterKind === 'all' || kind === filterKind
      return matchesSearch && matchesKind
    })

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
        result.sort((a, b) =>
          categoryLabel(a.category).localeCompare(categoryLabel(b.category), 'th')
        )
        break
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    return result
  }, [transactions, searchQuery, filterKind, sortBy])

  const grouped = useMemo(() => {
    if (groupBy === 'list') return null
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date)
      let key: string
      switch (groupBy) {
        case 'day':
          key = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
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
      if (!groups[key]) groups[key] = []
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

  const handleOpenEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (updates: any) => {
    if (!editingTransaction) return
    await updateTransaction(editingTransaction.id, updates)
    setIsEditModalOpen(false)
    setEditingTransaction(null)
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">
          ประวัติรายการ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          ดูและจัดการรายการทั้งหมด
        </p>
      </div>

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

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="ค้นหาตามรายละเอียดหรือหมวดหมู่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'daily_cost', 'household', 'monthly_revenue', 'monthly_ads', 'other'] as const).map(
              (kind) => (
                <button
                  key={kind}
                  onClick={() => setFilterKind(kind)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    filterKind === kind
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {kindLabel[kind]}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                เรียงลำดับตาม
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input text-sm w-full"
              >
                {(['date-desc', 'date-asc', 'amount-desc', 'amount-asc', 'category'] as const).map(
                  (sort) => (
                    <option key={sort} value={sort}>
                      {sortLabel[sort]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {groupBy === 'list' && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                ไม่มีรายการ
              </CardContent>
            </Card>
          ) : (
            filtered.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black dark:text-white truncate">
                        {categoryLabel(transaction.category)}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {transaction.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(new Date(transaction.date))}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenEdit(transaction)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {groupBy !== 'list' && grouped && (
        <div className="space-y-3">
          {Object.entries(grouped)
            .sort(([keyA], [keyB]) => keyB.localeCompare(keyA, 'th'))
            .map(([groupKey, items]) => {
              const income = items
                .filter((t) => t.type === 'income')
                .reduce((s, t) => s + t.amount, 0)
              const expense = items
                .filter((t) => t.type === 'expense')
                .reduce((s, t) => s + t.amount, 0)
              const net = income - expense
              const isExpanded = expandedGroups.has(groupKey)

              return (
                <Card key={groupKey}>
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleGroupExpanded(groupKey)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-black dark:text-white">
                          {groupKey}
                        </p>
                        <div className="sm:hidden text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
                          <div>รายรับ: {formatCurrency(income)}</div>
                          <div>รายจ่าย: {formatCurrency(expense)}</div>
                          <div
                            className={
                              net >= 0
                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-red-600 dark:text-red-400 font-semibold'
                            }
                          >
                            สุทธิ: {formatCurrency(net)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex gap-4 text-sm">
                          <div className="text-right">
                            <p className="text-gray-600 dark:text-gray-400">รายรับ</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(income)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600 dark:text-gray-400">รายจ่าย</p>
                            <p className="font-semibold text-red-600 dark:text-red-400">
                              {formatCurrency(expense)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600 dark:text-gray-400">สุทธิ</p>
                            <p
                              className={`font-semibold ${
                                net >= 0
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {formatCurrency(net)}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-gray-600 dark:text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-2">
                        {items.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            ไม่มีรายการ
                          </p>
                        ) : (
                          items.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-black dark:text-white text-sm">
                                  {categoryLabel(transaction.category)}
                                </p>
                                {transaction.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {transaction.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <div className="text-right">
                                  <p
                                    className={`font-semibold text-sm ${
                                      transaction.type === 'income'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleOpenEdit(transaction)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} className="text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => deleteTransaction(transaction.id)}
                                  className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      <EditTransactionModal
        isOpen={isEditModalOpen}
        transaction={editingTransaction}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTransaction(null)
        }}
        onSave={handleSaveEdit}
      />
    </>
  )
}
