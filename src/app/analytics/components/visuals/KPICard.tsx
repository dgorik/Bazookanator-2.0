'use client'

import { cn } from '@/src/utils/utils'
import { Card, CardContent } from '@/src/components/ui/other - shadcn/card'
import { formatters } from '@/src/utils/utils'

interface KPICardProps {
  title: string
  value: number | null
  growth: number | null
  target: number | null
  valueFormatter?: (value: number) => string
  subtitle?: string
  className?: string
}

export default function KPICard({
  title,
  value,
  growth,
  target,
  valueFormatter,
  className,
}: KPICardProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'KPICard.tsx:25',
      message: 'KPICard props received',
      data: {
        title,
        value,
        growth,
        target,
        valueIsNull: value === null,
        targetIsNull: target === null,
        growthIsNull: growth === null,
        valueType: typeof value,
        targetType: typeof target,
      },
      timestamp: Date.now(),
      hypothesisId: 'D,E',
    }),
  }).catch(() => {})
  // #endregion
  // Show empty state if no filters selected
  if (value === null || target === null || growth === null) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'KPICard.tsx:31',
        message: 'Showing empty state',
        data: { title, reason: 'value, target, or growth is null' },
        timestamp: Date.now(),
        hypothesisId: 'D',
      }),
    }).catch(() => {})
    // #endregion
    return (
      <Card className={cn('w-full', className)}>
        <CardContent>
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {title}
            </h3>
          </div>
          <div className="flex h-40 items-center justify-center px-6 py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Select filters to view data
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = growth >= 0
  const percentage = target !== 0 ? (value / target) * 100 : 0
  const formattedValue = valueFormatter
    ? valueFormatter(value)
    : formatters.compactCurrency({ number: value, maxFractionDigits: 1 })
  const formattedTarget = valueFormatter
    ? valueFormatter(target)
    : formatters.compactCurrency({ number: target, maxFractionDigits: 1 })

  return (
    <Card
      className={cn(
        'w-full overflow-hidden transition-all duration-200 hover:shadow-lg',
        'border-gray-200 dark:border-gray-800',
        className,
      )}
    >
      <CardContent>
        {/* Header with title and growth badge */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <div
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold',
              isPositive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
            )}
          >
            <span>{percentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Main value */}
        <div className="px-3 py-5">
          <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {formattedValue}
          </div>
        </div>

        {/* Progress section */}
        <div className="bg-gray-50 px-6 py-4 dark:bg-gray-900/50">
          {/* Progress bar */}
          <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                isPositive
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400',
              )}
              style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex flex-row justify-between">
            <div className="flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Actual
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {formattedValue}
              </span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Target
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {formattedTarget}
              </span>
            </div>
          </div>

          {/* Achievement percentage */}
          <div className="mt-3 text-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {percentage.toFixed(1)}% of target achieved
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
