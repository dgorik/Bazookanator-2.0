'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import KPICard from './visuals/KPICard'
import {
  getSalesValueTarget,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'

interface KPISectionProps {
  filters: SalesFilters
  targetFilters: SalesFilters
  selectedLocation?: string
  selectedBrand?: string
  selectedCategory?: string
  timeView: TimeView
  className?: string
  onResetLocation?: () => void
  onResetBrand?: () => void
  onResetCategory?: () => void
}

//hahahah

type SalesValueTargetRow = {
  value_sales: number | null
  target_sales: number | null
}

type Metric = {
  value: number | null
  target: number | null
  growth: number | null
}

const EMPTY_METRIC: Metric = { value: null, target: null, growth: null }

function getTimeViewLabel(timeView: TimeView): string {
  switch (timeView) {
    case 'monthly':
      return 'Monthly'
    case 'qtd':
      return 'Quarter to date'
    case 'ytd':
      return 'YTD'
    case 'total':
    default:
      return 'Total'
  }
}

function toMetric(row: SalesValueTargetRow | null): Metric {
  if (!row) return EMPTY_METRIC
  const value = Number(row.value_sales ?? 0)
  const target = Number(row.target_sales ?? 0)
  const growth = target !== 0 ? ((value - target) / target) * 100 : 0
  return { value, target, growth }
}

export default function KPISection({
  filters,
  targetFilters,
  selectedLocation,
  selectedBrand,
  selectedCategory,
  onResetLocation,
  onResetBrand,
  onResetCategory,
  timeView,
  className,
}: KPISectionProps) {
  const timeLabel = getTimeViewLabel(timeView)
  const valueMeasure = filters.measure
  const targetMeasure = targetFilters.measure
  const hasMeasures = Boolean(valueMeasure && targetMeasure)

  const baseFilters: Omit<SalesFilters, 'measure'> = {
    division: filters.division,
    brand: filters.brand,
    category: filters.category,
    location: filters.location,
    month: filters.month,
  }

  const { data: totalRow } = useSWR(
    hasMeasures
      ? ['kpi-total', valueMeasure, targetMeasure, baseFilters, timeView]
      : null,
    () =>
      getSalesValueTarget(
        valueMeasure as string,
        targetMeasure as string,
        baseFilters,
        timeView,
      ) as Promise<SalesValueTargetRow | null>,
    { revalidateOnFocus: false },
  )

  const { data: locationRow } = useSWR(
    hasMeasures && selectedLocation
      ? [
          'kpi-location',
          valueMeasure,
          targetMeasure,
          baseFilters,
          selectedLocation,
          timeView,
        ]
      : null,
    () =>
      getSalesValueTarget(
        valueMeasure as string,
        targetMeasure as string,
        { ...baseFilters, location: 'selectedLocation' },
        timeView,
      ) as Promise<SalesValueTargetRow | null>,
    { revalidateOnFocus: false },
  )

  const { data: brandRow } = useSWR(
    hasMeasures && selectedBrand
      ? [
          'kpi-brand',
          valueMeasure,
          targetMeasure,
          baseFilters,
          selectedBrand,
          timeView,
        ]
      : null,
    () =>
      getSalesValueTarget(
        valueMeasure as string,
        targetMeasure as string,
        { ...baseFilters, brand: selectedBrand },
        timeView,
      ) as Promise<SalesValueTargetRow | null>,
    { revalidateOnFocus: false },
  )

  const { data: categoryRow } = useSWR(
    hasMeasures && selectedCategory
      ? [
          'kpi-category',
          valueMeasure,
          targetMeasure,
          baseFilters,
          selectedCategory,
          timeView,
        ]
      : null,
    () =>
      getSalesValueTarget(
        valueMeasure as string,
        targetMeasure as string,
        { ...baseFilters, category: selectedCategory },
        timeView,
      ) as Promise<SalesValueTargetRow | null>,
    { revalidateOnFocus: false },
  )

  const totalMetrics = useMemo(() => toMetric(totalRow ?? null), [totalRow])

  const locationMetrics = useMemo(
    () => (selectedLocation ? toMetric(locationRow ?? null) : EMPTY_METRIC),
    [selectedLocation, locationRow],
  )

  const brandMetrics = useMemo(
    () => (selectedBrand ? toMetric(brandRow ?? null) : EMPTY_METRIC),
    [selectedBrand, brandRow],
  )

  const categoryMetrics = useMemo(
    () => (selectedCategory ? toMetric(categoryRow ?? null) : EMPTY_METRIC),
    [selectedCategory, categoryRow],
  )

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}
    >
      <KPICard
        title={`${timeLabel} Sales`}
        value={totalMetrics.value}
        target={totalMetrics.target}
        growth={totalMetrics.growth}
      />

      <KPICard
        title={`${timeLabel} Location Sales`}
        value={locationMetrics.value}
        target={locationMetrics.target}
        growth={locationMetrics.growth}
        onReset={selectedLocation ? onResetLocation : undefined}
      />

      <KPICard
        title={`${timeLabel} Brand Sales`}
        value={brandMetrics.value}
        target={brandMetrics.target}
        growth={brandMetrics.growth}
        onReset={selectedBrand ? onResetBrand : undefined}
      />

      <KPICard
        title={`${timeLabel} Category Sales`}
        value={categoryMetrics.value}
        target={categoryMetrics.target}
        growth={categoryMetrics.growth}
        onReset={selectedCategory ? onResetCategory : undefined}
      />
    </div>
  )
}
