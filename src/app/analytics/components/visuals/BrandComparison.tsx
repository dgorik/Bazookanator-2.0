'use client'

import { useMemo } from 'react'
import { BarChart } from '@tremor/react'
import { formatters, cn } from '@/src/utils/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/other - shadcn/card'

interface BrandComparisonProps {
  data: { brand: string; measure_1_val: number; measure_2_val: number }[]
  measure1: string
  measure2: string
  title?: string
  description?: string
  className?: string
}

export default function BrandComparison({
  data,
  measure1,
  measure2,
  title = 'Brand Comparison',
  description = 'Compare brand performance across measures',
  className,
}: BrandComparisonProps) {
  //here we are populating measure_1_val and measure_2_val with actuals measure names
  const transformedData = useMemo(() => {
    return data.map((item) => ({
      brand: item.brand,
      [measure1]: item.measure_1_val,
      [measure2]: item.measure_2_val,
    }))
  }, [data, measure1, measure2])

  const categories = useMemo(() => [measure1, measure2], [measure1, measure2])

  const valueFormatter = useMemo(
    () => (value: number) =>
      formatters.currency({ number: value, maxFractionDigits: 0 }),
    [],
  )

  if (!data?.length) {
    return (
      <Card className={cn('w-full', className)}>
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
          colors={['blue', 'orange']}
          showLegend
          showGridLines
          xAxisLabel="Brand"
          yAxisLabel="Value"
        />
      </CardContent>
    </Card>
  )
}
