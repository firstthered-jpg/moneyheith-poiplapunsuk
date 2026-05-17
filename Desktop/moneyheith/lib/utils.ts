import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

import {
  CATEGORY_DAILY_COST,
  CATEGORY_MONTHLY_REVENUE,
  CATEGORY_MONTHLY_ADS,
  HOUSEHOLD_PREFIX,
} from './types'

export function categoryLabel(category: string): string {
  if (category === CATEGORY_DAILY_COST) return 'ต้นทุนรายวัน'
  if (category === CATEGORY_MONTHLY_REVENUE) return 'ยอดรายรับเดือน'
  if (category === CATEGORY_MONTHLY_ADS) return 'ค่าโฆษณา'
  if (category.startsWith(HOUSEHOLD_PREFIX)) {
    return 'รายจ่ายในบ้าน • ' + category.slice(HOUSEHOLD_PREFIX.length)
  }
  return category
}

export type TxKind = 'all' | 'daily_cost' | 'household' | 'monthly_revenue' | 'monthly_ads' | 'other'

export function kindOfCategory(category: string): TxKind {
  if (category === CATEGORY_DAILY_COST) return 'daily_cost'
  if (category === CATEGORY_MONTHLY_REVENUE) return 'monthly_revenue'
  if (category === CATEGORY_MONTHLY_ADS) return 'monthly_ads'
  if (category.startsWith(HOUSEHOLD_PREFIX)) return 'household'
  return 'other'
}
