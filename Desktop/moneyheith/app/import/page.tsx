'use client'

import React, { useState, useRef } from 'react'
import Header from '@/components/Header'
import { Card, CardContent } from '@/components/Card'
import { useFinanceStore } from '@/lib/store-supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Upload, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ParsedTransaction {
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  error?: string
}

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addTransaction } = useFinanceStore()
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [columnMapping, setColumnMapping] = useState({
    date: 'วันที่',
    description: 'รายละเอียด',
    category: 'หมวดหมู่',
    amount: 'จำนวนเงิน',
    type: 'ประเภท',
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      setError(null)
      setFile(selectedFile)
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet)

      // Parse transactions
      const parsed: ParsedTransaction[] = rows.map((row: any, idx) => {
        try {
          const dateStr = row[columnMapping.date] || row['วันที่']
          const description = row[columnMapping.description] || row['รายละเอียด'] || ''
          const category = row[columnMapping.category] || row['หมวดหมู่'] || 'อื่นๆ'
          const amountStr = row[columnMapping.amount] || row['จำนวนเงิน']
          const typeStr = row[columnMapping.type] || row['ประเภท'] || 'expense'

          // Parse date
          let date: Date
          if (typeof dateStr === 'number') {
            // Excel date number
            date = new Date((dateStr - 25569) * 86400 * 1000)
          } else {
            date = new Date(dateStr)
          }

          if (isNaN(date.getTime())) {
            return {
              date: '',
              description,
              category,
              amount: 0,
              type: 'expense',
              error: 'รูปแบบวันที่ไม่ถูกต้อง',
            }
          }

          // Parse amount
          const amount = parseFloat(String(amountStr).replace(/,/g, ''))
          if (isNaN(amount) || amount === 0) {
            return {
              date: date.toISOString(),
              description,
              category,
              amount: 0,
              type: 'expense',
              error: 'จำนวนเงินไม่ถูกต้อง',
            }
          }

          // Determine type
          const type = (String(typeStr).toLowerCase().includes('รับ') ||
                       String(typeStr).toLowerCase().includes('income'))
            ? 'income'
            : 'expense'

          return {
            date: date.toISOString(),
            description: String(description),
            category: String(category),
            amount: Math.abs(amount),
            type,
          }
        } catch (err) {
          return {
            date: '',
            description: '',
            category: '',
            amount: 0,
            type: 'expense',
            error: `แถวที่ ${idx + 1}: ${String(err).substring(0, 50)}`,
          }
        }
      })

      setTransactions(parsed)
      setImported(0)
    } catch (err) {
      setError(`ไม่สามารถอ่านไฟล์: ${String(err).substring(0, 100)}`)
      setTransactions([])
    }
  }

  const handleImport = async () => {
    const validTransactions = transactions.filter((t) => !t.error)

    if (validTransactions.length === 0) {
      setError('ไม่มีรายการที่ถูกต้องเพื่อนำเข้า')
      return
    }

    try {
      setImporting(true)
      setError(null)

      let successCount = 0
      for (const transaction of validTransactions) {
        try {
          await addTransaction({
            description: transaction.description,
            category: transaction.category,
            amount: transaction.amount,
            type: transaction.type,
            date: transaction.date,
          })
          successCount++
        } catch (err) {
          console.error('Error importing transaction:', err)
        }
      }

      setImported(successCount)
      if (successCount === validTransactions.length) {
        setTransactions([])
        setFile(null)
      }
    } catch (err) {
      setError(`เกิดข้อผิดพลาด: ${String(err).substring(0, 100)}`)
    } finally {
      setImporting(false)
    }
  }

  const validTransactions = transactions.filter((t) => !t.error)
  const invalidTransactions = transactions.filter((t) => t.error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            นำเข้าข้อมูล
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            นำเข้ารายรับและรายจ่ายจากไฟล์ Excel
          </p>
        </div>

        {imported > 0 && (
          <Card className="border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  นำเข้าสำเร็จ! {imported} รายการ
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  ข้อมูลถูกเพิ่มเข้าระบบแล้ว
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">
                  เกิดข้อผิดพลาด
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        {transactions.length === 0 && imported === 0 && (
          <Card>
            <CardContent className="py-12">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={40} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  เลือกไฟล์ Excel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  รองรับ: .xlsx, .xls
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Template Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  📋 รูปแบบไฟล์ที่รองรับ
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>ไฟล์ Excel ของคุณควรมีคอลัมน์ดังต่อไปนี้:</p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg font-mono text-xs">
                    <div>📅 วันที่ (YYYY-MM-DD หรือ Excel Date)</div>
                    <div>📝 รายละเอียด (ข้อความ)</div>
                    <div>🏷️ หมวดหมู่ (ชื่อหมวดหมู่)</div>
                    <div>💰 จำนวนเงิน (ตัวเลข)</div>
                    <div>📊 ประเภท (รายรับ/รายจ่าย)</div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    ตัวอย่าง:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-xs overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600">
                          <th className="text-left px-2">วันที่</th>
                          <th className="text-left px-2">รายละเอียด</th>
                          <th className="text-left px-2">หมวดหมู่</th>
                          <th className="text-right px-2">จำนวนเงิน</th>
                          <th className="text-left px-2">ประเภท</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1">2026-05-15</td>
                          <td className="px-2 py-1">ขายสินค้า</td>
                          <td className="px-2 py-1">ขาย</td>
                          <td className="text-right px-2 py-1">5000</td>
                          <td className="px-2 py-1">รายรับ</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1">2026-05-14</td>
                          <td className="px-2 py-1">ค่าน้ำ</td>
                          <td className="px-2 py-1">สาธารณูปโภค</td>
                          <td className="text-right px-2 py-1">150</td>
                          <td className="px-2 py-1">รายจ่าย</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {transactions.length > 0 && (
          <>
            {/* Summary */}
            <Card>
              <CardContent className="py-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      รวมทั้งสิ้น
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {transactions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      ถูกต้อง
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {validTransactions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      ข้อผิดพลาด
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {invalidTransactions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invalid Transactions */}
            {invalidTransactions.length > 0 && (
              <Card className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="py-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                    ⚠️ รายการที่มีข้อผิดพลาด ({invalidTransactions.length})
                  </h3>
                  <div className="space-y-2 text-sm">
                    {invalidTransactions.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded"
                      >
                        <span className="text-yellow-800 dark:text-yellow-200">
                          {t.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Valid Transactions Preview */}
            {validTransactions.length > 0 && (
              <Card>
                <CardContent className="py-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    ✓ รายการที่นำเข้า ({validTransactions.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                            วันที่
                          </th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                            รายละเอียด
                          </th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                            หมวดหมู่
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                            จำนวนเงิน
                          </th>
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                            ประเภท
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {validTransactions.slice(0, 20).map((t, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                              {formatDate(new Date(t.date))}
                            </td>
                            <td className="py-3 px-3 text-gray-900 dark:text-white truncate">
                              {t.description || '-'}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                              {t.category}
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency(t.amount)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  t.type === 'income'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                }`}
                              >
                                {t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validTransactions.length > 20 && (
                      <p className="text-center py-4 text-gray-600 dark:text-gray-400 text-sm">
                        และอีก {validTransactions.length - 20} รายการ...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTransactions([])
                  setFile(null)
                  setImported(0)
                  setError(null)
                }}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleImport}
                disabled={validTransactions.length === 0 || importing}
                className="flex-1 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white transition-colors font-medium disabled:cursor-not-allowed"
              >
                {importing ? 'กำลังนำเข้า...' : `นำเข้า ${validTransactions.length} รายการ`}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
