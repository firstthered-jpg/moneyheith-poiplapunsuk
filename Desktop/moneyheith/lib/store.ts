'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, DashboardStats } from './types'
import { MOCK_TRANSACTIONS } from './constants'
import { calculatePercentageChange, generateId } from './utils'

interface FinanceStore {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void

  period: 'day' | 'month' | 'year'
  setPeriod: (period: 'day' | 'month' | 'year') => void
  getDashboardStats: () => DashboardStats
}

function getPeriodStart(period: 'day' | 'month' | 'year', from: Date = new Date()): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  if (period === 'month') d.setDate(1)
  if (period === 'year') {
    d.setMonth(0)
    d.setDate(1)
  }
  return d
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: MOCK_TRANSACTIONS,

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [
            { ...transaction, id: generateId() },
            ...state.transactions,
          ],
        }))
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }))
      },

      period: 'month',
      setPeriod: (period) => set({ period }),

      getDashboardStats: () => {
        const state = get()
        const now = new Date()
        const startDate = getPeriodStart(state.period, now)

        const currentTransactions = state.transactions.filter((t) => {
          const tDate = new Date(t.date)
          return tDate >= startDate && tDate <= now
        })

        const totalIncome = currentTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const totalExpense = currentTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        // Previous period
        const prevStartDate = new Date(startDate)
        const prevEndDate = new Date(startDate)
        prevEndDate.setMilliseconds(-1)

        if (state.period === 'day') {
          prevStartDate.setDate(prevStartDate.getDate() - 1)
        } else if (state.period === 'month') {
          prevStartDate.setMonth(prevStartDate.getMonth() - 1)
        } else {
          prevStartDate.setFullYear(prevStartDate.getFullYear() - 1)
        }

        const prevTransactions = state.transactions.filter((t) => {
          const tDate = new Date(t.date)
          return tDate >= prevStartDate && tDate <= prevEndDate
        })

        const prevIncome = prevTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const prevExpense = prevTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
          incomeChange: calculatePercentageChange(totalIncome, prevIncome),
          expenseChange: calculatePercentageChange(totalExpense, prevExpense),
          period: state.period,
        }
      },
    }),
    {
      name: 'finance-store',
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
)
