import { supabase } from './supabase'
import type { Transaction } from './types'

/**
 * Fetch daily metrics for a date range
 */
export async function fetchDailyData(daysBack: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', new Date().toISOString())
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching daily data:', error)
    return []
  }
}

/**
 * Fetch expense breakdown by category
 */
export async function fetchExpenseBreakdown(monthOffset: number = 0) {
  try {
    const date = new Date()
    date.setMonth(date.getMonth() + monthOffset)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'expense')
      .gte('date', monthStart.toISOString())
      .lte('date', monthEnd.toISOString())
      .order('amount', { ascending: false })

    if (error) throw error

    // Group by category
    const breakdown = (data || []).reduce(
      (acc, transaction) => {
        const cat = transaction.category
        if (!acc[cat]) {
          acc[cat] = { category: cat, total: 0, count: 0, items: [] }
        }
        acc[cat].total += transaction.amount
        acc[cat].count += 1
        acc[cat].items.push(transaction)
        return acc
      },
      {} as Record<
        string,
        { category: string; total: number; count: number; items: Transaction[] }
      >
    )

    return Object.values(breakdown).sort((a, b) => b.total - a.total)
  } catch (error) {
    console.error('Error fetching expense breakdown:', error)
    return []
  }
}

/**
 * Fetch monthly statistics
 */
export async function fetchMonthlyStats(monthOffset: number = 0) {
  try {
    const date = new Date()
    date.setMonth(date.getMonth() + monthOffset)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', monthStart.toISOString())
      .lte('date', monthEnd.toISOString())

    if (error) throw error

    const transactions = data || []
    const revenue = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      month: date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
      revenue,
      expenses,
      profit: revenue - expenses,
      transactionCount: transactions.length,
      margin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
    }
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return {
      month: 'N/A',
      revenue: 0,
      expenses: 0,
      profit: 0,
      transactionCount: 0,
      margin: 0,
    }
  }
}

/**
 * Fetch top expenses
 */
export async function fetchTopExpenses(limit: number = 5, daysBack: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'expense')
      .gte('date', startDate.toISOString())
      .order('amount', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching top expenses:', error)
    return []
  }
}

/**
 * Fetch trend data for chart
 */
export async function fetchTrendData(daysBack: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true })

    if (error) throw error

    // Group by date
    const dailyData: Record<
      string,
      { date: string; revenue: number; expenses: number }
    > = {}

    ;(data || []).forEach((transaction) => {
      const date = transaction.date.split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, expenses: 0 }
      }

      if (transaction.type === 'income') {
        dailyData[date].revenue += transaction.amount
      } else {
        dailyData[date].expenses += transaction.amount
      }
    })

    return Object.values(dailyData)
  } catch (error) {
    console.error('Error fetching trend data:', error)
    return []
  }
}

/**
 * Compare two months
 */
export async function compareMonths(month1Offset: number, month2Offset: number) {
  const stats1 = await fetchMonthlyStats(month1Offset)
  const stats2 = await fetchMonthlyStats(month2Offset)

  return {
    current: stats1,
    previous: stats2,
    revenueChange: stats1.revenue - stats2.revenue,
    revenueChangePercent:
      stats2.revenue > 0 ? ((stats1.revenue - stats2.revenue) / stats2.revenue) * 100 : 0,
    profitChange: stats1.profit - stats2.profit,
    profitChangePercent:
      stats2.profit > 0 ? ((stats1.profit - stats2.profit) / stats2.profit) * 100 : 0,
  }
}
