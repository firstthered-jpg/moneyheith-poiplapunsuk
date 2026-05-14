'use client'

import React from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon?: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  color?: 'green' | 'red' | 'blue' | 'yellow'
  variant?: 'minimal' | 'featured'
}

const colorMap = {
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    accent: 'bg-green-100 dark:bg-green-900/40',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    accent: 'bg-red-100 dark:bg-red-900/40',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'bg-blue-100 dark:bg-blue-900/40',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    accent: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
}

export default function StatCard({
  icon,
  label,
  value,
  subValue,
  color = 'blue',
  variant = 'minimal',
}: StatCardProps) {
  const colors = colorMap[color]

  if (variant === 'featured') {
    return (
      <Card className={cn('overflow-hidden transition-all', colors.bg)}>
        <div className="p-6">
          {icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                colors.accent
              )}
            >
              <div className={cn('text-xl', colors.icon)}>{icon}</div>
            </div>
          )}
          <div className="text-card-label">{label}</div>
          <div className="text-card-value mt-2">{value}</div>
          {subValue && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {subValue}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-4', colors.bg)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-card-label">{label}</div>
          <div className="text-2xl font-bold text-black dark:text-white mt-1">
            {value}
          </div>
          {subValue && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subValue}
            </div>
          )}
        </div>
        {icon && <div className={cn('text-2xl', colors.icon)}>{icon}</div>}
      </div>
    </Card>
  )
}
