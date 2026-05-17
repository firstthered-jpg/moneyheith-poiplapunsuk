'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionTable() {
  const { transactions } = useFinanceStore()

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex-between">
        <CardTitle>รายการล่าสุด</CardTitle>
        <Link
          href="/history"
          className="text-sm text-primary-400 hover:text-primary-500"
        >
          ดูทั้งหมด →
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            ยังไม่มีรายการ
          </div>
        ) : (
          <div className="divide-y divide-border-light dark:divide-gray-800">
            {recent.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-black dark:text-white truncate">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(new Date(tx.date))} • {tx.category}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
