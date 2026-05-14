'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AppSettings {
  shopName?: string
  logo?: string
}

const navItems = [
  { label: 'แดชบอร์ด', href: '/' },
  { label: 'รายรับ', href: '/income' },
  { label: 'รายจ่าย', href: '/expense' },
  { label: 'วิเคราะห์', href: '/analytics' },
  { label: 'ประวัติ', href: '/history' },
  { label: 'นำเข้า', href: '/import' },
  { label: 'ตั้งค่า', href: '/settings' },
]

export default function Header() {
  const pathname = usePathname()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    setIsHydrated(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border-light dark:border-gray-800">
      <div className="container-max flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          {isHydrated && settings?.logo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={settings.logo}
                alt="Shop logo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-lime flex items-center justify-center text-white text-lg">
              💰
            </div>
          )}
          <div className="hidden sm:block text-black dark:text-white">
            <div className="text-sm font-bold leading-tight">
              {isHydrated && settings?.shopName ? settings.shopName.split(' ')[0] : 'Moneyheith'}
            </div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isHydrated && settings?.shopName && settings.shopName.includes(' ')
                ? settings.shopName.split(' ').slice(1).join(' ')
                : 'PoiplaPunsuk'}
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                pathname === item.href
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
