'use client'

import { create } from 'zustand'
import type { Transaction, DashboardStats } from './types'
import { MOCK_TRANSACTIONS } from './constants'
import { calculatePercentageChange, generateId } from './utils'
import { supabase } from './supabase'

interface FinanceStore {
  transactions: Transaction[]
  isLoading: boolean
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  fetchTransactions: () => Promise<void>

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

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: MOCK_TRANSACTIONS,
  isLoading: false,

  fetchTransactions: async () => {
    try {
      set({ isLoading: true })
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      set({ transactions: data || MOCK_TRANSACTIONS })
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      // Fallback to mock data
      set({ transactions: MOCK_TRANSACTIONS })
    } finally {
      set({ isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    try {
      const id = generateId()
      const t = transaction as Omit<Transaction, 'id'> & {
        deductions?: unknown[]
        tags?: unknown[]
      }
      const { error } = await supabase.from('transactions').insert({
        id,
        ...transaction,
        date: new Date(transaction.date).toISOString(),
        deductions: t.deductions || [],
        tags: t.tags || [],
      })

      if (error) throw error

      set((state) => ({
        transactions: [
          { ...transaction, id },
          ...state.transactions,
        ],
      }))
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }))
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
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
}))
