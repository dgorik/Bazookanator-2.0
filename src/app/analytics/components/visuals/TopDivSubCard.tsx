'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { cn, formatters } from '@/src/utils/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/other - shadcn/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/src/components/ui/tremor/Table'
import {
  getTopDivSubVariance,
  type TimeView,
  type SalesFilters,
  type VarianceDriverRow,
} from '@/src/lib/fetcher/fetchers'

type Direction = 'winners' | 'losers'

interface TopDivSubCardProps {
  valueMeasure?: string
  targetMeasure?: string
  filters: Omit<SalesFilters, 'measure'>
  timeView: TimeView
  className?: string
}

function VarianceCell({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={cn(
        'text-xs font-semibold',
        isPositive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400',
      )}
    >
      {formatters.compactCurrency({ number: value, maxFractionDigits: 1 })}
    </span>
  )
}

function VariancePctCell({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={cn(
        'text-xs font-semibold',
        isPositive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400',
      )}
    >
      {value.toFixed(1)}%
    </span>
  )
}

export default function TopDivSubCard({
  valueMeasure,
  targetMeasure,
  filters,
  timeView,
  className,
}: TopDivSubCardProps) {
  const [direction, setDirection] = useState<Direction>('losers')

  const hasMeasures =
    !!valueMeasure &&
    !!targetMeasure &&
    valueMeasure !== 'blank' &&
    targetMeasure !== 'blank'

  const { data: rows, isLoading } = useSWR(
    hasMeasures
      ? [
          'top-div-sub',
          valueMeasure,
          targetMeasure,
          filters,
          timeView,
          direction,
        ]
      : null,
    () =>
      getTopDivSubVariance(
        valueMeasure as string,
        targetMeasure as string,
        filters,
        timeView,
        direction,
        5,
      ),
    { revalidateOnFocus: false },
  )

  return (
    <Card className={cn('flex w-full flex-col', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Top 5 by Div/Sub
          </CardTitle>
          {/* Winners / Losers toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setDirection('winners')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all',
                direction === 'winners'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              )}
            >
              Winners
            </button>
            <button
              type="button"
              onClick={() => setDirection('losers')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all',
                direction === 'losers'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              )}
            >
              Losers
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          </div>
        ) : !hasMeasures ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Select measures to view data
            </p>
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
              Requires <code className="text-xs">get_top_div_sub_variance</code>{' '}
              RPC in Supabase
            </p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-y border-gray-200 dark:border-gray-800">
                <TableHeaderCell className="whitespace-nowrap py-1.5 text-xs">
                  Div/Sub
                </TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap py-1.5 text-right text-xs">
                  Var $
                </TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap py-1.5 text-right text-xs">
                  Var %
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: VarianceDriverRow) => (
                <TableRow
                  key={row.group_value}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="whitespace-nowrap py-2 text-xs font-medium text-gray-900 dark:text-gray-50">
                    {row.group_value}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-right">
                    <VarianceCell value={row.variance_sales} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-right">
                    <VariancePctCell value={row.variance_pct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
