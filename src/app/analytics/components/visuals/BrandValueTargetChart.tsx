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
  getFilteredBrands,
  getSalesValueTarget,
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
  const measuresInvalid =
    !valueMeasure ||
    !targetMeasure ||
    valueMeasure === 'blank' ||
    targetMeasure === 'blank'

  // Fetch sales data grouped by brand
  const { data, isLoading, error } = useSWR(
    !measuresInvalid
      ? [
          'sales-by-brand',
          valueMeasure,
          valueMeasureYear,
          targetMeasure,
          targetMeasureYear,
          filters,
          timeView,
        ]
      : null,
    async () => {
      const brands = filters.brand
        ? [filters.brand]
        : await getFilteredBrands({
            measure: valueMeasure,
            division: filters.division,
            category: filters.category,
            location: filters.location,
            month: filters.month,
          })

      const rows = await Promise.all(
        brands.map(async (brand) => {
          const row = await getSalesValueTarget(
            valueMeasure,
            targetMeasure,
            { ...filters, brand },
            timeView,
          )

          return {
            brand,
            value_measure: Number(row?.value_sales ?? 0),
            target_measure: Number(row?.target_sales ?? 0),
          }
        }),
      )

      return rows
    },
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

  // If measures are not ready / collide, don't render Bars keyed by category
  if (measuresInvalid) {
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
