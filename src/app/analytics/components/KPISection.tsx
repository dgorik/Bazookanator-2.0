'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import KPICard from './visuals/KPICard'
import {
  getSalesData,
  getTopCategorySales,
  getTopSubBrandSales,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'

interface KPISectionProps {
  filters: SalesFilters
  targetFilters: SalesFilters
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

// Create stable cache keys using JSON.stringify
function createCacheKey(
  prefix: string,
  filters: SalesFilters,
  timeView: TimeView,
): string {
  return `${prefix}-${JSON.stringify(filters)}-${timeView}`
}

export default function KPISection({
  filters,
  targetFilters,
  timeView,
  className,
}: KPISectionProps) {
  const timeLabel = getTimeViewLabel(timeView)

  // Create stable filter objects for location-specific queries
  const bosFilters = useMemo(() => ({ ...filters, location: 'BOS' }), [filters])
  const frontFilters = useMemo(
    () => ({ ...filters, location: 'Front' }),
    [filters],
  )

  // Fetch total sales (value and target) with stable keys
  const { data: valueData } = useSWR(
    createCacheKey('sales-value', filters, timeView),
    () => getSalesData(filters, timeView),
    { revalidateOnFocus: false },
  )
  const { data: targetData } = useSWR(
    createCacheKey('sales-target', targetFilters, timeView),
    () => getSalesData(targetFilters, timeView),
    { revalidateOnFocus: false },
  )

  // Fetch BOS and Front location sales with stable keys
  const { data: bosData } = useSWR(
    createCacheKey('sales-bos', bosFilters, timeView),
    () => getSalesData(bosFilters, timeView),
    { revalidateOnFocus: false },
  )
  const { data: frontData } = useSWR(
    createCacheKey('sales-front', frontFilters, timeView),
    () => getSalesData(frontFilters, timeView),
    { revalidateOnFocus: false },
  )

  // Fetch top category with stable key
  const { data: topCategory } = useSWR(
    createCacheKey('top-category', filters, timeView),
    () => getTopCategorySales(filters, timeView),
    { revalidateOnFocus: false },
  )

  // Fetch top subbrand with stable key
  const { data: topSubBrand } = useSWR(
    createCacheKey('top-subbrand', filters, timeView),
    () => getTopSubBrandSales(filters, timeView),
    { revalidateOnFocus: false },
  )

  // Calculate metrics
  const totalMetrics = useMemo(() => {
    const val = Number(valueData) || 0
    const tgt = Number(targetData) || 0
    const growth = tgt !== 0 ? ((val - tgt) / tgt) * 100 : 0
    return { value: val, target: tgt, growth }
  }, [valueData, targetData])

  const locationMetrics = useMemo(() => {
    const bos = Number(bosData) || 0
    const front = Number(frontData) || 0
    const total = bos + front
    const target = Number(targetData) || 0
    const growth = target !== 0 ? ((total - target) / target) * 100 : 0
    return {
      value: total,
      target,
      growth,
      bos,
      front,
    }
  }, [bosData, frontData, targetData])

  const categoryMetrics = useMemo(() => {
    if (!topCategory) {
      return { value: 0, target: 0, growth: 0, category: null }
    }
    const val = Number(topCategory.sales) || 0
    const tgt = Number(targetData) || 0
    const growth = tgt !== 0 ? ((val - tgt) / tgt) * 100 : 0
    return {
      value: val,
      target: tgt,
      growth,
      category: topCategory.category,
    }
  }, [topCategory, targetData])

  const subBrandMetrics = useMemo(() => {
    if (!topSubBrand) {
      return { value: 0, target: 0, growth: 0, subBrand: null }
    }
    const val = Number(topSubBrand.sales) || 0
    const tgt = Number(targetData) || 0
    const growth = tgt !== 0 ? ((val - tgt) / tgt) * 100 : 0
    return {
      value: val,
      target: tgt,
      growth,
      subBrand: topSubBrand.sub_brand,
    }
  }, [topSubBrand, targetData])

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}
    >
      {/* Card 1: Total Sales */}
      <KPICard
        title={`${timeLabel} Sales`}
        value={totalMetrics.value}
        target={totalMetrics.target}
        growth={totalMetrics.growth}
      />

      {/* Card 2: Location Breakdown */}
      <KPICard
        title={`${timeLabel} Location Sales`}
        value={locationMetrics.value}
        target={locationMetrics.target}
        growth={locationMetrics.growth}
      />

      {/* Card 3: Top Category */}
      <KPICard
        title={`${timeLabel} Category Sales`}
        value={categoryMetrics.value}
        target={categoryMetrics.target}
        growth={categoryMetrics.growth}
      />

      {/* Card 4: Top SubBrand */}
      <KPICard
        title={`${timeLabel} SubBrand Sales`}
        value={subBrandMetrics.value}
        target={subBrandMetrics.target}
        growth={subBrandMetrics.growth}
      />
    </div>
  )
}
