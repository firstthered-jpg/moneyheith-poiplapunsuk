'use client'

import React, { useState, useMemo } from 'react'
import Header from '@/components/Header'
import { Card, CardContent } from '@/components/Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'

type ExportType = 'all' | 'monthly' | 'category' | 'daily' | 'summary'

interface ExportOptions {
  type: ExportType
  startDate: string
  endDate: string
  includeFormulas: boolean
}

export default function ExportPage() {
  const { transactions } = useFinanceStore()
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'all',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeFormulas: true,
  })
  const [exported, setExported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const filteredTransactions = useMemo(() => {
    const start = new Date(exportOptions.startDate)
    const end = new Date(exportOptions.endDate)
    end.setHours(23, 59, 59, 999)

    return transactions.filter((t) => {
      const txDate = new Date(t.date)
      return txDate >= start && txDate <= end
    })
  }, [transactions, exportOptions.startDate, exportOptions.endDate])

  const generateMonthlyReport = () => {
    const data: any[] = []
    const months: { [key: string]: typeof filteredTransactions } = {}

    // Group by month
    filteredTransactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit' })
      if (!months[monthKey]) months[monthKey] = []
      months[monthKey].push(t)
    })

    // Create report
    Object.entries(months).forEach(([month, txns]) => {
      const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const profit = income - expense

      data.push({
        'เดือน': month,
        'รายรับ': income,
        'รายจ่าย': expense,
        'กำไรสุทธิ': profit,
        'จำนวนรายการ': txns.length,
      })
    })

    return data
  }

  const generateCategoryReport = () => {
    const categories: { [key: string]: typeof filteredTransactions } = {}

    filteredTransactions.forEach((t) => {
      if (!categories[t.category]) categories[t.category] = []
      categories[t.category].push(t)
    })

    const data = Object.entries(categories).map(([category, txns]) => {
      const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

      return {
        'หมวดหมู่': category,
        'รายรับ': income,
        'รายจ่าย': expense,
        'สุทธิ': income - expense,
        'จำนวนรายการ': txns.length,
      }
    })

    return data.sort((a, b) => Math.abs(b['สุทธิ'] as number) - Math.abs(a['สุทธิ'] as number))
  }

  const generateDailyReport = () => {
    const days: { [key: string]: typeof filteredTransactions } = {}

    filteredTransactions.forEach((t) => {
      const dateKey = new Date(t.date).toLocaleDateString('th-TH')
      if (!days[dateKey]) days[dateKey] = []
      days[dateKey].push(t)
    })

    return Object.entries(days)
      .map(([date, txns]) => {
        const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

        return {
          'วันที่': date,
          'รายรับ': income,
          'รายจ่าย': expense,
          'กำไรสุทธิ': income - expense,
          'จำนวนรายการ': txns.length,
        }
      })
      .reverse()
  }

  const generateSummaryReport = () => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const totalProfit = totalIncome - totalExpense
    const avgIncome = filteredTransactions.filter((t) => t.type === 'income').length
      ? totalIncome / filteredTransactions.filter((t) => t.type === 'income').length
      : 0
    const avgExpense = filteredTransactions.filter((t) => t.type === 'expense').length
      ? totalExpense / filteredTransactions.filter((t) => t.type === 'expense').length
      : 0

    return [
      {
        'รายการ': 'รวมรายรับ',
        'จำนวน': totalIncome,
        'จำนวนรายการ': filteredTransactions.filter((t) => t.type === 'income').length,
      },
      {
        'รายการ': 'รวมรายจ่าย',
        'จำนวน': totalExpense,
        'จำนวนรายการ': filteredTransactions.filter((t) => t.type === 'expense').length,
      },
      {
        'รายการ': 'กำไรสุทธิ',
        'จำนวน': totalProfit,
        'จำนวนรายการ': filteredTransactions.length,
      },
      { 'รายการ': '', 'จำนวน': '', 'จำนวนรายการ': '' },
      {
        'รายการ': 'ค่าเฉลี่ยรายรับต่อรายการ',
        'จำนวน': avgIncome,
        'จำนวนรายการ': '',
      },
      {
        'รายการ': 'ค่าเฉลี่ยรายจ่ายต่อรายการ',
        'จำนวน': avgExpense,
        'จำนวนรายการ': '',
      },
    ]
  }

  const handleExport = async () => {
    try {
      setError(null)

      const workbook = XLSX.utils.book_new()
      const fileName = `Moneyheith_Report_${new Date().toISOString().split('T')[0]}.xlsx`

      if (exportOptions.type === 'all') {
        // All transactions
        const data = filteredTransactions.map((t) => ({
          'วันที่': formatDate(new Date(t.date)),
          'รายละเอียด': t.description || '-',
          'หมวดหมู่': t.category,
          'ประเภท': t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
          'จำนวนเงิน': t.amount,
        }))

        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'ทั้งหมด')
      } else if (exportOptions.type === 'monthly') {
        const data = generateMonthlyReport()
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'รายเดือน')
      } else if (exportOptions.type === 'category') {
        const data = generateCategoryReport()
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'หมวดหมู่')
      } else if (exportOptions.type === 'daily') {
        const data = generateDailyReport()
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'รายวัน')
      } else if (exportOptions.type === 'summary') {
        const data = generateSummaryReport()
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'สรุป')

        // Add detailed transactions sheet
        if (filteredTransactions.length > 0) {
          const detailData = filteredTransactions.map((t) => ({
            'วันที่': formatDate(new Date(t.date)),
            'รายละเอียด': t.description || '-',
            'หมวดหมู่': t.category,
            'ประเภท': t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
            'จำนวนเงิน': t.amount,
          }))
          XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(detailData), 'รายละเอียด')
        }
      }

      // Add info sheet
      const infoData = [
        ['Moneyheith PoiplaPunsuk - รายงาน', ''],
        ['วันที่สร้าง', new Date().toLocaleString('th-TH')],
        ['ช่วงเวลา', `${exportOptions.startDate} ถึง ${exportOptions.endDate}`],
        ['จำนวนรายการ', filteredTransactions.length],
        ['', ''],
        ['รายรับทั้งหมด', filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)],
        ['รายจ่ายทั้งหมด', filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)],
        ['กำไรสุทธิ', filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
          filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)],
      ]

      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(infoData), 'ข้อมูล')

      XLSX.writeFile(workbook, fileName)
      setExported(true)
      setTimeout(() => setExported(false), 3000)
    } catch (err) {
      setError(`ไม่สามารถสร้างรายงาน: ${String(err).substring(0, 100)}`)
      console.error('Export error:', err)
    }
  }

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            📊 ส่งออกรายงาน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ส่งออกข้อมูลรายรับ-รายจ่ายเป็นไฟล์ Excel
          </p>
        </div>

        {exported && (
          <Card className="border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  ส่งออกสำเร็จ!
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  ไฟล์ Excel ถูกดาวน์โหลดไปยังเครื่องของคุณ
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-900 dark:text-red-100 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <Card>
          <CardContent className="py-6 space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                📋 ประเภทรายงาน
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'all', label: 'ทั้งหมด', icon: '📑', desc: 'รายการทั้งหมด' },
                  { id: 'monthly', label: 'รายเดือน', icon: '📅', desc: 'สรุปรายเดือน' },
                  { id: 'category', label: 'หมวดหมู่', icon: '🏷️', desc: 'สรุปตามหมวดหมู่' },
                  { id: 'daily', label: 'รายวัน', icon: '📆', desc: 'สรุปรายวัน' },
                  { id: 'summary', label: 'สรุป', icon: '📊', desc: 'สรุปทั้งหมด' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setExportOptions({ ...exportOptions, type: option.id as ExportType })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      exportOptions.type === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">{option.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
                📅 ช่วงเวลา
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={exportOptions.startDate}
                    onChange={(e) =>
                      setExportOptions({ ...exportOptions, startDate: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={exportOptions.endDate}
                    max={today}
                    onChange={(e) =>
                      setExportOptions({ ...exportOptions, endDate: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <Card>
            <CardContent className="py-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📊 สรุปข้อมูล
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">รายรับ</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">รายจ่าย</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">กำไร</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalIncome - totalExpense)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                📌 จำนวนรายการ: <span className="font-bold">{filteredTransactions.length}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {filteredTransactions.length === 0 && (
          <Card className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="py-6 text-center">
              <p className="text-yellow-900 dark:text-yellow-100 font-medium">
                ⚠️ ไม่พบรายการในช่วงเวลาที่เลือก
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                ลองเปลี่ยนช่วงวันที่เพื่อค้นหารายการ
              </p>
            </CardContent>
          </Card>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={filteredTransactions.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-bold transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed text-lg"
        >
          <Download size={20} />
          ส่งออกเป็น Excel
        </button>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
          <CardContent className="py-4 space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>ℹ️ ข้อมูล:</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>✓ รายงานจะมี 2-3 Sheet ตามประเภท</li>
              <li>✓ ชีท "ข้อมูล" มี metadata เกี่ยวกับรายงาน</li>
              <li>✓ ชีทสรุป มีตัวเลขทั้งหมด</li>
              <li>✓ ชีทรายละเอียด มีรายการทั้งหมด (ถ้ามี)</li>
              <li>✓ รองรับการเปิดด้วย Excel, Google Sheets, LibreOffice</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
