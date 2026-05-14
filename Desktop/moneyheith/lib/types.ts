export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: Date
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  netProfit: number
  incomeChange: number
  expenseChange: number
  period: 'day' | 'month' | 'year'
}
