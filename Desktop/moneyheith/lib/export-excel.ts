import { formatDate } from './utils'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string | Date
}

interface ExportOptions {
  transactions: Transaction[]
  period: 'week' | 'month' | 'year'
  filterType?: 'all' | 'income' | 'expense'
}

const normalizeDate = (date: string | Date): Date => {
  if (typeof date === 'string') {
    return new Date(date)
  }
  return new Date(date)
}

const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const generateCSVContent = (transactions: Transaction[], period: 'week' | 'month' | 'year'): string => {
  // Group transactions
  const grouped: Record<string, Transaction[]> = {}

  transactions.forEach((tx) => {
    const date = normalizeDate(tx.date)
    let key: string

    switch (period) {
      case 'week': {
        const year = date.getFullYear()
        const week = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)
        key = `Week ${week}, ${year}`
        break
      }
      case 'month': {
        key = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
        break
      }
      case 'year': {
        key = date.getFullYear().toString()
        break
      }
      default:
        key = 'อื่น ๆ'
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(tx)
  })

  let csv = ''

  // Add summary section
  csv += 'สรุป\n'
  csv += 'ช่วงเวลา,รายรับ,รายจ่าย,สุทธิ\n'

  let totalIncome = 0
  let totalExpense = 0

  Object.entries(grouped).forEach(([period, items]) => {
    const income = items.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = items.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const net = income - expense

    totalIncome += income
    totalExpense += expense

    csv += `${period},${income},${expense},${net}\n`
  })

  csv += `รวมทั้งสิ้น,${totalIncome},${totalExpense},${totalIncome - totalExpense}\n\n`

  // Add detail section
  csv += 'รายละเอียด\n'
  csv += 'วันที่,ประเภท,หมวดหมู่,จำนวนเงิน,รายละเอียด\n'

  transactions.forEach((tx) => {
    const date = normalizeDate(tx.date)
    const dateStr = formatDate(date)
    const typeStr = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'

    csv += `${escapeCSV(dateStr)},${escapeCSV(typeStr)},${escapeCSV(tx.category)},${tx.amount},${escapeCSV(tx.description)}\n`
  })

  return csv
}

export const exportToExcel = async (options: ExportOptions) => {
  try {
    const { transactions, period, filterType = 'all' } = options

    console.log('Export started:', { totalTransactions: transactions.length, period, filterType })

    if (!transactions || transactions.length === 0) {
      alert('ไม่มีรายการข้อมูลให้ส่งออก')
      return
    }

    // Filter transactions
    let filteredTransactions = transactions
    if (filterType !== 'all') {
      filteredTransactions = transactions.filter((t) => t.type === filterType)
    }

    if (filteredTransactions.length === 0) {
      alert('ไม่มีรายการข้อมูลที่ตรงกับตัวกรองให้ส่งออก')
      return
    }

    console.log('Filtered transactions:', filteredTransactions.length)

    // Generate CSV content
    const csvContent = generateCSVContent(filteredTransactions, period)

    console.log('CSV generated, size:', csvContent.length)

    // Create Blob and download
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    // Generate filename
    const now = new Date()
    const dateStr = now.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    const periodLabel = period === 'week' ? 'รายวีค' : period === 'month' ? 'รายเดือน' : 'รายปี'
    const filename = `Moneyheith_${periodLabel}_${dateStr}.xlsx`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('File downloaded:', filename)

    alert('ส่งออกข้อมูลสำเร็จ!')
  } catch (error) {
    console.error('Export error:', error)
    alert('เกิดข้อผิดพลาดในการส่งออก: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}
