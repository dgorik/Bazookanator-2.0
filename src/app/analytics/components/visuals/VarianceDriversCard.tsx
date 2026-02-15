'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { BarChart } from '@/src/components/ui/tremor/barchart'
import { formatters, cn } from '@/src/utils/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/other - shadcn/card'
import {
  getVarianceDrivers,
  type TimeView,
  type SalesFilters,
  type DrillLevel,
} from '@/src/lib/fetcher/fetchers'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VarianceDriversCardProps {
  valueMeasure?: string
  targetMeasure?: string
  filters: Omit<SalesFilters, 'measure'>
  timeView: TimeView
  selectedBrand?: string
  selectedCategory?: string
  onBrandSelect: (brand: string) => void
  onCategorySelect: (category: string) => void
  onSubBrandSelect: (subBrand: string) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDrillLevel(
  selectedBrand?: string,
  selectedCategory?: string,
): DrillLevel {
  if (selectedBrand && selectedCategory) return 'sub_brand'
  if (selectedBrand) return 'category'
  return 'brand'
}

function getDrillTitle(level: DrillLevel): string {
  switch (level) {
    case 'brand':
      return 'Variance Drivers by Brand'
    case 'category':
      return 'Variance Drivers by Category'
    case 'sub_brand':
      return 'Variance Drivers by Sub-brand'
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VarianceDriversCard({
  valueMeasure,
  targetMeasure,
  filters,
  timeView,
  selectedBrand,
  selectedCategory,
  onBrandSelect,
  onCategorySelect,
  onSubBrandSelect,
  className,
}: VarianceDriversCardProps) {
  const [mode, setMode] = useState<'dollars' | 'percent'>('dollars')

  const hasMeasures = Boolean(valueMeasure && targetMeasure)
  const level = getDrillLevel(selectedBrand, selectedCategory)
  const title = getDrillTitle(level)

  // Build scoped filters based on current drill selections
  const scopedFilters = useMemo(
    () => ({
      ...filters,
      brand: selectedBrand,
      category: selectedCategory,
    }),
    [filters, selectedBrand, selectedCategory],
  )

  // Fetch variance data
  const { data, isLoading, error } = useSWR(
    hasMeasures
      ? [
          'variance-drivers',
          valueMeasure,
          targetMeasure,
          scopedFilters,
          timeView,
          level,
        ]
      : null,
    () =>
      getVarianceDrivers(
        valueMeasure!,
        targetMeasure!,
        scopedFilters,
        timeView,
        level,
      ),
  )

  // Transform data for diverging bar chart
  const chartData = useMemo(() => {
    if (!data?.length) return []

    // Sort by absolute variance descending
    const sorted = [...data].sort(
      (a, b) => Math.abs(b.variance_sales) - Math.abs(a.variance_sales),
    )

    return sorted.map((row) => {
      const val = mode === 'dollars' ? row.variance_sales : row.variance_pct
      return {
        name: row.group_value || 'Unknown',
        ...(val >= 0 ? { 'Above Target': val } : { 'Below Target': val }),
      }
    })
  }, [data, mode])

  // Value formatter
  const valueFormatter = useMemo(() => {
    if (mode === 'dollars') {
      return (v: number) =>
        formatters.compactCurrency({ number: v, maxFractionDigits: 1 })
    }
    return (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
  }, [mode])

  // Click handler for drill-down
  const handleBarClick = (
    payload: { eventType: string; [key: string]: unknown } | null | undefined,
  ) => {
    if (!payload || payload.eventType === 'category') return
    const name = payload.name as string | undefined
    if (!name) return

    switch (level) {
      case 'brand':
        onBrandSelect(name)
        break
      case 'category':
        onCategorySelect(name)
        break
      case 'sub_brand':
        onSubBrandSelect(name)
        break
    }
  }

  // ---- Render states ----

  if (!hasMeasures) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select value and target measures to see variance drivers.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    const errMsg =
      error instanceof Error ? error.message : JSON.stringify(error)
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 flex-col items-center justify-center gap-2">
          <p className="text-sm text-red-500 dark:text-red-400">
            Error loading data. Please try again.
          </p>
          <p className="max-w-md text-center text-xs text-gray-400 dark:text-gray-500">
            {errMsg}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading data...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!chartData.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <div className="flex gap-1 rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setMode('dollars')}
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              mode === 'dollars'
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
            )}
          >
            $
          </button>
          <button
            type="button"
            onClick={() => setMode('percent')}
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              mode === 'percent'
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
            )}
          >
            %
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <BarChart
          className="h-80"
          data={chartData}
          index="name"
          categories={['Above Target', 'Below Target']}
          colors={['emerald', 'pink']}
          type="stacked"
          layout="vertical"
          valueFormatter={valueFormatter}
          showLegend
          showGridLines
          onValueChange={handleBarClick}
          yAxisWidth={120}
          xAxisLabel={mode === 'dollars' ? 'Variance ($)' : 'Variance (%)'}
        />
      </CardContent>
    </Card>
  )
}
