'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { Card, CardContent } from '@/components/Card'
import { Save, AlertCircle, CheckCircle, X } from 'lucide-react'

const CURRENCIES = [
  { code: 'THB', name: 'บาทไทย (฿)', symbol: '฿' },
  { code: 'USD', name: 'ดอลลาร์สหรัฐฯ ($)', symbol: '$' },
  { code: 'EUR', name: 'ยูโร (€)', symbol: '€' },
  { code: 'GBP', name: 'ปอนด์อังกฤษ (£)', symbol: '£' },
  { code: 'JPY', name: 'เยนญี่ปุ่น (¥)', symbol: '¥' },
]

const DECIMAL_FORMATS = [
  { value: 2, label: '1,234.56' },
  { value: 0, label: '1,234' },
]

const THOUSAND_SEPARATORS = [
  { value: 'comma', label: 'จุลภาค (1,234.56)' },
  { value: 'space', label: 'เว้นวรรค (1 234.56)' },
  { value: 'none', label: 'ไม่มี (1234.56)' },
]

interface AppSettings {
  shopName: string
  shopDescription: string
  logo?: string
  currency: string
  currencySymbol: string
  decimalPlaces: number
  thousandSeparator: 'comma' | 'space' | 'none'
  darkMode: boolean
  taxRate: number
  fiscalYearStart: 'jan' | 'apr' | 'custom'
  customFiscalDate?: string
}

const defaultSettings: AppSettings = {
  shopName: 'Moneyheith PoiplaPunsuk',
  shopDescription: 'ร้านค้าออนไลน์',
  currency: 'THB',
  currencySymbol: '฿',
  decimalPlaces: 2,
  thousandSeparator: 'comma',
  darkMode: false,
  taxRate: 0,
  fiscalYearStart: 'jan',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'business' | 'appearance' | 'format' | 'tax'>('business')

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
  }, [])

  const handleSave = async () => {
    try {
      setError(null)
      localStorage.setItem('appSettings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('ไม่สามารถบันทึกการตั้งค่า')
      console.error('Failed to save settings:', err)
    }
  }

  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCIES.find((c) => c.code === code)
    if (currency) {
      setSettings({
        ...settings,
        currency: code,
        currencySymbol: currency.symbol,
      })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องน้อยกว่า 2MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('โปรดอัปโหลดไฟล์รูปภาพเท่านั้น')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setSettings({ ...settings, logo: result })
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logo: undefined })
  }

  const tabs = [
    { id: 'business', label: '🏪 ข้อมูลร้านค้า' },
    { id: 'appearance', label: '🎨 ลักษณะการแสดงผล' },
    { id: 'format', label: '🔢 รูปแบบตัวเลข' },
    { id: 'tax', label: '📊 ภาษีและการเงิน' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header />

      <main className="container-max py-8 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            ⚙️ การตั้งค่า
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            จัดการข้อมูลร้านค้าและการแสดงผลของแอปพลิเคชัน
          </p>
        </div>

        {/* Notification */}
        {saved && (
          <Card className="border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
              <p className="text-green-900 dark:text-green-100 font-medium">
                บันทึกการตั้งค่าสำเร็จ!
              </p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-900 dark:text-red-100 font-medium">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Business Information */}
        {activeTab === 'business' && (
          <Card>
            <CardContent className="py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  🏪 ชื่อร้านค้า
                </label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="input w-full"
                  placeholder="เช่น Moneyheith PoiplaPunsuk"
                />
                <p className="text-xs text-gray-500 mt-2">
                  ชื่อร้านค้าของคุณจะแสดงในหัวของแอปพลิเคชัน
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  🖼️ โลโก้ร้านค้า
                </label>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Upload Area */}
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                      <div className="text-center">
                        <div className="text-3xl mb-2">📸</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          คลิกเพื่ออัปโหลด
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG (สูงสุด 2MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview */}
                  {settings.logo && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-32 h-32 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <img
                          src={settings.logo}
                          alt="Shop logo preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
                      >
                        <X size={16} />
                        ลบโลโก้
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  โลโก้ของคุณจะแสดงในหัวของแอปพลิเคชัน แนะนำให้ใช้รูปภาพสี่เหลี่ยมจัตุรัสหรือสัญลักษณ์ ขนาดประมาณ 200x200 พิกเซล
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  📝 คำอธิบายร้านค้า
                </label>
                <textarea
                  value={settings.shopDescription}
                  onChange={(e) => setSettings({ ...settings, shopDescription: e.target.value })}
                  className="input w-full resize-none"
                  rows={3}
                  placeholder="เช่น ร้านค้าออนไลน์ขายเสื้อผ้า"
                />
                <p className="text-xs text-gray-500 mt-2">
                  คำอธิบายเพิ่มเติมเกี่ยวกับธุรกิจของคุณ
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  💱 สกุลเงิน
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        settings.currency === curr.code
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold text-lg">{curr.symbol}</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {curr.code}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {curr.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance */}
        {activeTab === 'appearance' && (
          <Card>
            <CardContent className="py-6 space-y-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary-500"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    🌙 เปิดโหมดมืด
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-8">
                  ใช้ธีมมืดสำหรับการดูง่ายในที่มืด
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  📊 ตัวอย่างการแสดงผล
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      จำนวนเงิน:
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {settings.currencySymbol}5,234.56
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Number Format */}
        {activeTab === 'format' && (
          <Card>
            <CardContent className="py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  🔢 ตำแหน่งทศนิยม
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DECIMAL_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setSettings({ ...settings, decimalPlaces: format.value })}
                      className={`p-4 rounded-lg border-2 text-left font-medium transition-all ${
                        settings.decimalPlaces === format.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  🔣 ตัวแยกจำนวน
                </label>
                <div className="space-y-2">
                  {THOUSAND_SEPARATORS.map((sep) => (
                    <button
                      key={sep.value}
                      onClick={() =>
                        setSettings({ ...settings, thousandSeparator: sep.value as any })
                      }
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        settings.thousandSeparator === sep.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {sep.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  ตัวอย่าง:
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      ยอดเล็ก
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {settings.currencySymbol}123{settings.thousandSeparator === 'comma' ? ',' : settings.thousandSeparator === 'space' ? ' ' : ''}456.78
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      ยอดกลาง
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {settings.currencySymbol}1{settings.thousandSeparator === 'comma' ? ',' : settings.thousandSeparator === 'space' ? ' ' : ''}234{settings.thousandSeparator === 'comma' ? ',' : settings.thousandSeparator === 'space' ? ' ' : ''}567
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      ยอดมาก
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {settings.currencySymbol}12{settings.thousandSeparator === 'comma' ? ',' : settings.thousandSeparator === 'space' ? ' ' : ''}345{settings.thousandSeparator === 'comma' ? ',' : settings.thousandSeparator === 'space' ? ' ' : ''}678
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax & Finance */}
        {activeTab === 'tax' && (
          <Card>
            <CardContent className="py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  📊 อัตราภาษี (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  className="input w-full"
                  placeholder="เช่น 7"
                />
                <p className="text-xs text-gray-500 mt-2">
                  อัตราภาษีมูลค่าเพิ่มหรืออัตราภาษีอื่นๆ
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  📅 ปีงบประมาณ
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'jan', label: 'มกราคม - ธันวาคม (ปีปกติ)' },
                    { id: 'apr', label: 'เมษายน - มีนาคม (ปีอังกฤษ)' },
                    { id: 'custom', label: 'กำหนดเอง' },
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="fiscalYear"
                        value={option.id}
                        checked={settings.fiscalYearStart === option.id}
                        onChange={(e) =>
                          setSettings({ ...settings, fiscalYearStart: e.target.value as any })
                        }
                        className="accent-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  💡 ข้อมูลการเงิน
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-xs text-blue-900 dark:text-blue-100 font-medium">
                      อัตราภาษีปัจจุบัน: <span className="font-bold">{settings.taxRate}%</span>
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-xs text-green-900 dark:text-green-100">
                      ใช้อัตราภาษีนี้เพื่อคำนวณภาษีในรายงาน (เร็วๆ นี้)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <Save size={18} />
            บันทึกการตั้งค่า
          </button>
        </div>

        {/* Info Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
          <CardContent className="py-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ ข้อมูล
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• การตั้งค่าจะถูกบันทึกในเบราว์เซอร์ของคุณ</li>
              <li>• ข้อมูลจะยังคงอยู่แม้ปิดแอปพลิเคชัน</li>
              <li>• คุณสามารถเปลี่ยนการตั้งค่าได้ทุกเมื่อ</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
