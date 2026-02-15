'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { cn, formatters } from '@/src/utils/utils'
import { Card, CardContent } from '@/src/components/ui/other - shadcn/card'
import {
  getSalesValueTarget,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'

interface HeadlineKPIProps {
  valueMeasure?: string
  targetMeasure?: string
  filters: Omit<SalesFilters, 'measure'>
  timeView: TimeView
  className?: string
}

function getTimeViewLabel(timeView: TimeView): string {
  switch (timeView) {
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly'
    case 'total':
    default:
      return 'Total'
  }
}

// ---------------------------------------------------------------------------
// Individual mini KPI card
// ---------------------------------------------------------------------------

interface MiniKPIProps {
  title: string
  value: string
  accent?: 'positive' | 'negative' | 'neutral'
}

function MiniKPI({ title, value, accent = 'neutral' }: MiniKPIProps) {
  return (
    <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800">
      <CardContent>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div
          className={cn(
            'mt-2 text-2xl font-bold tracking-tight',
            accent === 'positive' && 'text-emerald-600 dark:text-emerald-400',
            accent === 'negative' && 'text-red-600 dark:text-red-400',
            accent === 'neutral' && 'text-gray-900 dark:text-gray-50',
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function MiniKPIEmpty({ title }: { title: string }) {
  return (
    <Card className="w-full border-gray-200 dark:border-gray-800">
      <CardContent>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">—</div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HeadlineKPI({
  valueMeasure,
  targetMeasure,
  filters,
  timeView,
  className,
}: HeadlineKPIProps) {
  const hasMeasures = Boolean(valueMeasure && targetMeasure)

  const { data: row } = useSWR(
    hasMeasures
      ? ['headline-kpi', valueMeasure, targetMeasure, filters, timeView]
      : null,
    () =>
      getSalesValueTarget(
        valueMeasure as string,
        targetMeasure as string,
        filters,
        timeView,
      ),
    { revalidateOnFocus: false },
  )

  const metrics = useMemo(() => {
    if (!row) return null
    const value = Number(row.value_sales ?? 0)
    const target = Number(row.target_sales ?? 0)
    const variance = value - target
    const variancePct = target !== 0 ? ((value - target) / target) * 100 : 0
    return { value, target, variance, variancePct }
  }, [row])

  const timeLabel = getTimeViewLabel(timeView)

  // Empty state — show 4 placeholder cards
  if (!hasMeasures || !metrics) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
          className,
        )}
      >
        <MiniKPIEmpty title={`${timeLabel} Value`} />
        <MiniKPIEmpty title={`${timeLabel} Target`} />
        <MiniKPIEmpty title="Variance $" />
        <MiniKPIEmpty title="Variance %" />
      </div>
    )
  }

  const isPositive = metrics.variance >= 0

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {/* Card 1: Value Total */}
      <MiniKPI
        title={`${timeLabel} Value`}
        value={formatters.compactCurrency({
          number: metrics.value,
          maxFractionDigits: 1,
        })}
      />

      {/* Card 2: Target Total */}
      <MiniKPI
        title={`${timeLabel} Target`}
        value={formatters.compactCurrency({
          number: metrics.target,
          maxFractionDigits: 1,
        })}
      />

      {/* Card 3: Dollar Difference */}
      <MiniKPI
        title="Variance $"
        value={formatters.compactCurrency({
          number: metrics.variance,
          maxFractionDigits: 1,
        })}
        accent={isPositive ? 'positive' : 'negative'}
      />

      {/* Card 4: Percentage Difference */}
      <MiniKPI
        title="Variance %"
        value={`${metrics.variancePct >= 0 ? '+' : ''}${metrics.variancePct.toFixed(1)}%`}
        accent={isPositive ? 'positive' : 'negative'}
      />
    </div>
  )
}
