'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { BarChart } from '@/src/components/ui/tremor/barchart'
import { formatters, cn } from '@/src/utils/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/other - shadcn/card'
import {
  getSalesByBrand,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'

interface BrandSalesData {
  brand?: string
  value_measure?: number
  target_measure?: number
  [key: string]: unknown
}

interface BrandValueTargetChartProps {
  valueMeasure: string
  valueMeasureYear: number
  targetMeasure: string
  targetMeasureYear: number
  filters: Omit<SalesFilters, 'measure'>
  timeView: TimeView
  title?: string
  description?: string
  className?: string
}

export default function BrandValueTargetChart({
  valueMeasure,
  valueMeasureYear,
  targetMeasure,
  targetMeasureYear,
  filters,
  timeView,
  title = 'Brand Performance: Value vs Target',
  description = 'Compare actual sales against targets by brand',
  className,
}: BrandValueTargetChartProps) {
  // Fetch sales data grouped by brand
  const { data, isLoading, error } = useSWR(
    [
      'sales-by-brand',
      valueMeasure,
      valueMeasureYear,
      targetMeasure,
      targetMeasureYear,
      filters,
      timeView,
    ],
    () =>
      getSalesByBrand(
        valueMeasure,
        valueMeasureYear,
        targetMeasure,
        targetMeasureYear,
        filters,
        timeView,
      ),
  )

  // Transform data for Tremor BarChart
  // Expected format: [{ brand: string, [valueMeasure]: number, [targetMeasure]: number }]
  // Filter by brand if a specific brand is selected
  const transformedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []

    // Filter by brand if specified
    let filteredData: BrandSalesData[] = data as BrandSalesData[]
    if (filters.brand) {
      filteredData = filteredData.filter((item) => item.brand === filters.brand)
    }

    return filteredData.map((item) => {
      const brand = item.brand || 'Unknown'
      const valueRaw = item.value_measure ?? (item[valueMeasure] as number)
      const targetRaw = item.target_measure ?? (item[targetMeasure] as number)

      return {
        brand,
        [valueMeasure]: Number(valueRaw || 0),
        [targetMeasure]: Number(targetRaw || 0),
      }
    })
  }, [data, valueMeasure, targetMeasure, filters.brand])

  const categories = useMemo(() => {
    const cats = [valueMeasure, targetMeasure]
    const hasDuplicates = new Set(cats).size !== cats.length
    const hasBlankOrFalsy = cats.some((c) => !c || c === 'blank')

    // #region agent log
    if (hasDuplicates || hasBlankOrFalsy) {
      fetch(
        'http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
            location:
              'src/app/analytics/components/visuals/BrandValueTargetChart.tsx:categories',
            message: 'Computed categories for BarChart',
            data: {
              valueMeasure,
              targetMeasure,
              categories: cats,
              hasDuplicates,
              hasBlankOrFalsy,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {})
    }
    // #endregion

    return cats
  }, [valueMeasure, targetMeasure])

  const valueFormatter = useMemo(
    () => (value: number) =>
      formatters.currency({ number: value, maxFractionDigits: 0 }),
    [],
  )

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading data...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-red-500 dark:text-red-400">
            Error loading data. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!transformedData || transformedData.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No data available
          </p>
        </CardContent>
      </Card>
    )
  }

  const measuresInvalid =
    !valueMeasure ||
    !targetMeasure ||
    valueMeasure === 'blank' ||
    targetMeasure === 'blank'

  // If measures are not ready / collide, don't render Bars keyed by category
  if (measuresInvalid) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
        location:
          'src/app/analytics/components/visuals/BrandValueTargetChart.tsx:guard',
        message: 'Guarded BarChart render due to invalid/duplicate measures',
        data: {
          valueMeasure,
          targetMeasure,
          categories: [valueMeasure, targetMeasure],
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select two different measures to compare.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <BarChart
          className="h-80"
          data={transformedData}
          index="brand"
          categories={categories}
          valueFormatter={valueFormatter}
          colors={['blue', 'amber']}
          showLegend
          showGridLines
          xAxisLabel="Brand"
          yAxisLabel="Value"
          compactYAxis={true}
        />
      </CardContent>
    </Card>
  )
}
