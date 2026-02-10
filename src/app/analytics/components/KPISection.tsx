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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'KPISection.tsx:48',
      message: 'Component rendered with filters',
      data: { filters, targetFilters, timeView },
      timestamp: Date.now(),
      hypothesisId: 'B',
    }),
  }).catch(() => {})
  // #endregion

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
    createCacheKey('top-category', frontFilters, timeView),
    () => getTopCategorySales(frontFilters, timeView),
    { revalidateOnFocus: false },
  )

  // Fetch top subbrand with stable key
  const { data: topSubBrand } = useSWR(
    createCacheKey('top-subbrand', frontFilters, timeView),
    () => getTopSubBrandSales(frontFilters, timeView),
    { revalidateOnFocus: false },
  )

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'KPISection.tsx:95',
      message: 'Raw SWR data',
      data: {
        valueData,
        targetData,
        bosData,
        frontData,
        valueDataType: typeof valueData,
        targetDataType: typeof targetData,
      },
      timestamp: Date.now(),
      hypothesisId: 'A,C,D,E',
    }),
  }).catch(() => {})
  // #endregion

  // Calculate metrics
  const totalMetrics = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'KPISection.tsx:99',
        message: 'totalMetrics calculation',
        data: {
          valueData,
          targetData,
          valueIsNull: valueData === null,
          targetIsNull: targetData === null,
          valueIsUndefined: valueData === undefined,
          targetIsUndefined: targetData === undefined,
        },
        timestamp: Date.now(),
        hypothesisId: 'D',
        runId: 'post-fix',
      }),
    }).catch(() => {})
    // #endregion
    // If data is null or undefined, return empty state
    if (valueData == null || targetData == null) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'KPISection.tsx:104',
            message: 'Returning null metrics',
            data: { reason: 'valueData or targetData is null/undefined' },
            timestamp: Date.now(),
            hypothesisId: 'D',
            runId: 'post-fix',
          }),
        },
      ).catch(() => {})
      // #endregion
      return { value: null, target: null, growth: null }
    }
    const val = Number(valueData) || 0
    const tgt = Number(targetData) || 0
    const growth = tgt !== 0 ? ((val - tgt) / tgt) * 100 : 0
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'KPISection.tsx:112',
        message: 'Computed totalMetrics',
        data: { val, tgt, growth },
        timestamp: Date.now(),
        hypothesisId: 'E',
        runId: 'post-fix',
      }),
    }).catch(() => {})
    // #endregion
    return { value: val, target: tgt, growth }
  }, [valueData, targetData])

  const locationMetrics = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'KPISection.tsx:120',
        message: 'locationMetrics calculation',
        data: {
          bosData,
          frontData,
          targetData,
          bosIsNull: bosData === null,
          frontIsNull: frontData === null,
        },
        timestamp: Date.now(),
        hypothesisId: 'D',
        runId: 'post-fix',
      }),
    }).catch(() => {})
    // #endregion
    // If data is null or undefined, return empty state
    if (bosData == null || frontData == null || targetData == null) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'KPISection.tsx:126',
            message: 'Returning null location metrics',
            data: {
              reason: 'bosData, frontData, or targetData is null/undefined',
            },
            timestamp: Date.now(),
            hypothesisId: 'D',
            runId: 'post-fix',
          }),
        },
      ).catch(() => {})
      // #endregion
      return { value: null, target: null, growth: null, bos: null, front: null }
    }
    const bos = Number(bosData) || 0
    const front = Number(frontData) || 0
    const total = bos + front
    const target = Number(targetData) || 0
    const growth = target !== 0 ? ((total - target) / target) * 100 : 0
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'KPISection.tsx:136',
        message: 'Computed locationMetrics',
        data: { bos, front, total, target, growth },
        timestamp: Date.now(),
        hypothesisId: 'E',
        runId: 'post-fix',
      }),
    }).catch(() => {})
    // #endregion
    return {
      value: total,
      target,
      growth,
      bos,
      front,
    }
  }, [bosData, frontData, targetData])

  const categoryMetrics = useMemo(() => {
    // If data is null/undefined or no category, return empty state
    if (!topCategory || targetData == null) {
      return { value: null, target: null, growth: null, category: null }
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
    // If data is null/undefined or no subbrand, return empty state
    if (!topSubBrand || targetData == null) {
      return { value: null, target: null, growth: null, subBrand: null }
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
