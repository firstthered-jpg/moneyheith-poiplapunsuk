// Categories used to namespace records in the shared `transactions` table.
// We keep the existing schema (type IN ('income', 'expense')) and differentiate
// records by these category keys.
export const CATEGORY_DAILY_COST = 'daily_cost'
export const CATEGORY_MONTHLY_REVENUE = 'monthly_revenue'
export const CATEGORY_MONTHLY_ADS = 'monthly_ads'
export const HOUSEHOLD_PREFIX = 'household:'

export interface Payment {
  id: string
  amount: number
  description?: string
  paid_at: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: Date
  deductions?: Payment[]
}

export interface DailyCost {
  id: string
  date: Date
  amount: number
  description: string
  payments: Payment[]
}

export interface HouseholdExpense {
  id: string
  date: Date
  category: string
  amount: number
  description: string
}

export interface MonthlySummary {
  month: string // YYYY-MM
  revenue: number
  ads: number
  totalDailyCost: number
  totalHousehold: number
  storeNet: number      // revenue - totalDailyCost - ads
  remaining: number     // storeNet - totalHousehold
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  netProfit: number
  incomeChange: number
  expenseChange: number
  period: 'day' | 'month' | 'year'
}
