'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatters, cn } from '@/src/utils/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/src/components/ui/other - shadcn/card'
import {
  getSalesTrend,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'

interface TrendCardProps {
  valueMeasure?: string
  targetMeasure?: string
  filters: Omit<SalesFilters, 'measure'>
  timeView: TimeView
  className?: string
}

export default function TrendCard({
  valueMeasure,
  targetMeasure,
  filters,
  timeView,
  className,
}: TrendCardProps) {
  const hasMeasures =
    !!valueMeasure &&
    !!targetMeasure &&
    valueMeasure !== 'blank' &&
    targetMeasure !== 'blank'

  const canShowTrend = timeView !== 'total'

  const { data: trendData, isLoading } = useSWR(
    hasMeasures && canShowTrend
      ? ['sales-trend', valueMeasure, targetMeasure, filters, timeView]
      : null,
    () =>
      getSalesTrend(
        valueMeasure as string,
        targetMeasure as string,
        filters,
        timeView,
      ),
    { revalidateOnFocus: false },
  )

  const chartData = useMemo(() => {
    if (!trendData) return []
    return trendData.map((d) => ({
      period: d.period,
      Actual: d.value_sales,
      Target: d.target_sales,
    }))
  }, [trendData])

  const compactCurrency = (value: number) =>
    formatters.compactCurrency({ number: value, maxFractionDigits: 1 })

  const title = 'Actual vs Target Trend'
  const description =
    timeView === 'monthly'
      ? 'Monthly performance comparison'
      : timeView === 'quarterly'
        ? 'Quarterly performance comparison'
        : 'Select Monthly or Quarterly to view trend'

  // Total view – no trend available
  if (!canShowTrend) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Switch to Monthly or Quarterly to see the trend over time.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading trend data...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Empty / no measures
  if (!hasMeasures || chartData.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {!hasMeasures
              ? 'Select two different measures to compare.'
              : 'No data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                className="fill-gray-500 text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={compactCurrency}
                tick={{ fontSize: 12 }}
                className="fill-gray-500 text-xs"
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value: number) => compactCurrency(value)}
                contentStyle={{
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="Actual"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorActual)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Target"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorTarget)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
