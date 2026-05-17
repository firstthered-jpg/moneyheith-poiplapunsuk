'use client'

import { create } from 'zustand'
import {
  Transaction,
  DashboardStats,
  DailyCost,
  HouseholdExpense,
  Payment,
  MonthlySummary,
  CATEGORY_DAILY_COST,
  CATEGORY_MONTHLY_REVENUE,
  CATEGORY_MONTHLY_ADS,
  HOUSEHOLD_PREFIX,
} from './types'
import { calculatePercentageChange, generateId } from './utils'
import { supabase } from './supabase'

interface FinanceStore {
  transactions: Transaction[]
  isLoading: boolean
  fetchTransactions: () => Promise<void>

  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>

  // Daily costs
  addDailyCost: (input: { date: Date; amount: number; description?: string }) => Promise<void>
  addPaymentToDailyCost: (dailyCostId: string, payment: Omit<Payment, 'id'>) => Promise<void>
  removePaymentFromDailyCost: (dailyCostId: string, paymentId: string) => Promise<void>
  getDailyCosts: (year?: number, month?: number) => DailyCost[]

  // Household
  addHouseholdExpense: (input: {
    date: Date
    category: string
    amount: number
    description?: string
  }) => Promise<void>
  getHouseholdExpenses: (year?: number, month?: number) => HouseholdExpense[]

  // Monthly revenue / ads (one record per month)
  setMonthlyRevenue: (year: number, month: number, amount: number) => Promise<void>
  setMonthlyAds: (year: number, month: number, amount: number) => Promise<void>
  getMonthlyRevenue: (year: number, month: number) => number
  getMonthlyAds: (year: number, month: number) => number

  // Summary
  getMonthlySummary: (year: number, month: number) => MonthlySummary

  // Period & legacy dashboard helpers
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

function monthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1)
}

function monthEnd(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59, 999)
}

function inSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

function isHouseholdCategory(cat: string): boolean {
  return cat.startsWith(HOUSEHOLD_PREFIX)
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async () => {
    try {
      set({ isLoading: true })
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      set({ transactions: (data || []) as Transaction[] })
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      set({ transactions: [] })
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
          { ...transaction, id, deductions: (t.deductions as Payment[]) || [] },
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
      const { error } = await supabase.from('transactions').delete().eq('id', id)
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
      const payload: Record<string, unknown> = { ...updates }
      if (updates.date) payload.date = new Date(updates.date).toISOString()
      const { error } = await supabase.from('transactions').update(payload).eq('id', id)
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

  // ---- Daily costs --------------------------------------------------------
  addDailyCost: async ({ date, amount, description }) => {
    await get().addTransaction({
      type: 'expense',
      amount,
      category: CATEGORY_DAILY_COST,
      description: description || '',
      date,
    })
  },

  addPaymentToDailyCost: async (dailyCostId, payment) => {
    const state = get()
    const target = state.transactions.find((t) => t.id === dailyCostId)
    if (!target) return
    const newPayment: Payment = { id: generateId(), ...payment }
    const newDeductions: Payment[] = [...(target.deductions || []), newPayment]
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ deductions: newDeductions })
        .eq('id', dailyCostId)
      if (error) throw error
      set((s) => ({
        transactions: s.transactions.map((t) =>
          t.id === dailyCostId ? { ...t, deductions: newDeductions } : t
        ),
      }))
    } catch (error) {
      console.error('Failed to add payment:', error)
      throw error
    }
  },

  removePaymentFromDailyCost: async (dailyCostId, paymentId) => {
    const state = get()
    const target = state.transactions.find((t) => t.id === dailyCostId)
    if (!target) return
    const newDeductions = (target.deductions || []).filter((p) => p.id !== paymentId)
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ deductions: newDeductions })
        .eq('id', dailyCostId)
      if (error) throw error
      set((s) => ({
        transactions: s.transactions.map((t) =>
          t.id === dailyCostId ? { ...t, deductions: newDeductions } : t
        ),
      }))
    } catch (error) {
      console.error('Failed to remove payment:', error)
      throw error
    }
  },

  getDailyCosts: (year, month) => {
    const state = get()
    return state.transactions
      .filter((t) => t.category === CATEGORY_DAILY_COST)
      .filter((t) => {
        if (year == null || month == null) return true
        return inSameMonth(new Date(t.date), year, month)
      })
      .map<DailyCost>((t) => ({
        id: t.id,
        date: new Date(t.date),
        amount: t.amount,
        description: t.description,
        payments: t.deductions || [],
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  },

  // ---- Household ----------------------------------------------------------
  addHouseholdExpense: async ({ date, category, amount, description }) => {
    await get().addTransaction({
      type: 'expense',
      amount,
      category: HOUSEHOLD_PREFIX + category,
      description: description || '',
      date,
    })
  },

  getHouseholdExpenses: (year, month) => {
    const state = get()
    return state.transactions
      .filter((t) => isHouseholdCategory(t.category))
      .filter((t) => {
        if (year == null || month == null) return true
        return inSameMonth(new Date(t.date), year, month)
      })
      .map<HouseholdExpense>((t) => ({
        id: t.id,
        date: new Date(t.date),
        category: t.category.slice(HOUSEHOLD_PREFIX.length),
        amount: t.amount,
        description: t.description,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  },

  // ---- Monthly revenue items (multiple items per month) --------------------
  addMonthlyRevenueItem: async (year, month, name: string, amount: number) => {
    await get().addTransaction({
      type: 'income',
      amount,
      category: CATEGORY_MONTHLY_REVENUE,
      description: name,
      date: monthStart(year, month),
    })
  },

  removeMonthlyRevenueItem: async (id: string) => {
    await get().deleteTransaction(id)
  },

  getMonthlyRevenueItems: (year, month) => {
    const state = get()
    return state.transactions
      .filter(
        (t) =>
          t.category === CATEGORY_MONTHLY_REVENUE &&
          inSameMonth(new Date(t.date), year, month)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  },

  getMonthlyRevenue: (year, month) => {
    const items = get().getMonthlyRevenueItems(year, month)
    return items.reduce((sum, item) => sum + item.amount, 0)
  },

  // ---- Monthly ads (single value per month) --------------------------------
  setMonthlyAds: async (year, month, amount) => {
    const state = get()
    const existing = state.transactions.find(
      (t) =>
        t.category === CATEGORY_MONTHLY_ADS &&
        inSameMonth(new Date(t.date), year, month)
    )
    if (existing) {
      await get().updateTransaction(existing.id, { amount })
    } else {
      await get().addTransaction({
        type: 'expense',
        amount,
        category: CATEGORY_MONTHLY_ADS,
        description: '',
        date: monthStart(year, month),
      })
    }
  },

  getMonthlyAds: (year, month) => {
    const state = get()
    const t = state.transactions.find(
      (t) =>
        t.category === CATEGORY_MONTHLY_ADS &&
        inSameMonth(new Date(t.date), year, month)
    )
    return t?.amount ?? 0
  },

  // ---- Summary ------------------------------------------------------------
  getMonthlySummary: (year, month) => {
    const revenue = get().getMonthlyRevenue(year, month)
    const ads = get().getMonthlyAds(year, month)
    const dailyCosts = get().getDailyCosts(year, month)
    const totalDailyCost = dailyCosts.reduce((sum, dc) => sum + dc.amount, 0)
    const household = get().getHouseholdExpenses(year, month)
    const totalHousehold = household.reduce((sum, h) => sum + h.amount, 0)
    const storeNet = revenue - totalDailyCost - ads
    const remaining = storeNet - totalHousehold
    const key = `${year}-${String(month).padStart(2, '0')}`
    return {
      month: key,
      revenue,
      ads,
      totalDailyCost,
      totalHousehold,
      storeNet,
      remaining,
    }
  },

  // ---- Period / legacy ----------------------------------------------------
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
