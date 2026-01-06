'use client'

import { cn } from '@/src/utils/utils'
import { Card, CardContent } from '@/src/components/ui/other - shadcn/card'
import { formatters } from '@/src/utils/utils'

interface KPICardProps {
  title: string
  value: number
  growth: number
  target: number
  valueFormatter?: (value: number) => string
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
  const isPositive = growth >= 0
  const percentage = target !== 0 ? (value / target) * 100 : 0
  const formattedValue = valueFormatter
    ? valueFormatter(value)
    : formatters.currency({ number: value, maxFractionDigits: 0 })
  const formattedTarget = valueFormatter
    ? valueFormatter(target)
    : formatters.currency({ number: target, maxFractionDigits: 0 })

  return (
    <Card
      className={cn(
        'w-full overflow-hidden transition-all duration-200 hover:shadow-lg',
        'border-gray-200 dark:border-gray-800',
        className,
      )}
    >
      <CardContent className="p-0">
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
        <div className="px-6 py-5">
          <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
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
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Actual
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formattedValue}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Target
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
