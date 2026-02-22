import { createClient } from '@/src/lib/client/supabase/client'

function getSupabaseClient() {
  return createClient()
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SalesFilters {
  measure?: string
  year?: string
  division?: string
  brand?: string
  category?: string
  sub_brand?: string
  location?: string
  month?: string
  qtdStartMonth?: string
  qtdEndMonth?: string
}

export type TimeView = 'monthly' | 'qtd' | 'ytd' | 'total'

export type DrillLevel = 'brand' | 'category' | 'sub_brand'

export interface VarianceDriverRow {
  group_value: string
  value_sales: number
  target_sales: number
  variance_sales: number
  variance_pct: number
}

export interface TrendDataPoint {
  period: string
  value_sales: number
  target_sales: number
  variance_sales: number
}

// ---------------------------------------------------------------------------
// Generic filter options
// ---------------------------------------------------------------------------

export const getFilterOptions = async (columnName: string) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_filter_options', {
    column_name: columnName,
  })
  if (error) throw error
  return data || []
}

// ---------------------------------------------------------------------------
// Headline KPI – single aggregate (existing)
// ---------------------------------------------------------------------------

const _fetchSVTSingleMonth = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  month: string,
) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_sales_value_target', {
    p_value_measure: valueMeasure,
    p_target_measure: targetMeasure,
    p_division: filters.division,
    p_brand: filters.brand,
    p_category: filters.category,
    p_sub_brand: filters.sub_brand,
    p_location: filters.location,
    p_month: month,
    p_time_view: 'monthly',
  })
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}

export const getSalesValueTarget = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
) => {
  if (timeView === 'qtd' || timeView === 'ytd') {
    const months = getMonthRange(filters, timeView)
    if (!months.length) return null

    const results = await Promise.all(
      months.map((m) =>
        _fetchSVTSingleMonth(valueMeasure, targetMeasure, filters, m),
      ),
    )

    return {
      value_sales: results.reduce(
        (sum, r) => sum + Number(r?.value_sales ?? 0),
        0,
      ),
      target_sales: results.reduce(
        (sum, r) => sum + Number(r?.target_sales ?? 0),
        0,
      ),
    }
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_sales_value_target', {
    p_value_measure: valueMeasure,
    p_target_measure: targetMeasure,
    p_division: filters.division,
    p_brand: filters.brand,
    p_category: filters.category,
    p_sub_brand: filters.sub_brand,
    p_location: filters.location,
    p_month: filters.month,
    p_time_view: timeView,
  })
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}

// ---------------------------------------------------------------------------
// Filtered option lists (existing)
// ---------------------------------------------------------------------------

export const getFilteredLocations = async (filters: Partial<SalesFilters>) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_filtered_locations', {
    p_measure: filters.measure,
    p_division: filters.division,
    p_category: filters.category,
    p_brand: filters.brand,
    p_month: filters.month,
  })
  if (error) throw error
  return data?.map((item) => item.location) || []
}

export const getFilteredBrands = async (filters: Partial<SalesFilters>) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_filtered_brands', {
    p_measure: filters.measure,
    p_division: filters.division,
    p_category: filters.category,
    p_location: filters.location,
    p_month: filters.month,
  })
  if (error) throw error
  return data?.map((item) => item.brand) || []
}

export const getFilteredCategories = async (filters: Partial<SalesFilters>) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_filtered_categories', {
    p_measure: filters.measure,
    p_division: filters.division,
    p_brand: filters.brand,
    p_location: filters.location,
    p_month: filters.month,
  })
  if (error) throw error
  return data?.map((item) => item.category) || []
}

export const getFilteredSubBrands = async (filters: Partial<SalesFilters>) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_filtered_subbrands', {
    p_measure: filters.measure,
    p_division: filters.division,
    p_brand: filters.brand,
    p_category: filters.category,
    p_location: filters.location,
    p_month: filters.month,
  })
  if (error) throw error
  return data?.map((item) => item.sub_brand) || []
}

// ---------------------------------------------------------------------------
// Variance Drivers – grouped data
// ---------------------------------------------------------------------------

/** Remove undefined keys so Supabase/PostgREST only sends real values. */
function cleanParams<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as Record<string, unknown>
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v
  }
  return out as T
}

const _fetchBrandsSingleMonth = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  month: string,
): Promise<{ brand: string; value: number; target: number }[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc(
    'get_sales_by_brand',
    cleanParams({
      p_value_measure: valueMeasure,
      p_target_measure: targetMeasure,
      p_division: filters.division,
      p_category: filters.category,
      p_location: filters.location,
      p_month: month,
      p_time_view: 'monthly',
    }),
  )
  if (error) throw new Error(`get_sales_by_brand: ${error.message}`)
  return (data || []).map(
    (row: {
      brand: string
      value_measure: number
      target_measure: number
    }) => ({
      brand: row.brand,
      value: Number(row.value_measure ?? 0),
      target: Number(row.target_measure ?? 0),
    }),
  )
}

function mergeGroupedRows(
  monthlyResults: { key: string; value: number; target: number }[][],
): VarianceDriverRow[] {
  const map = new Map<string, { value: number; target: number }>()
  for (const rows of monthlyResults) {
    for (const row of rows) {
      const existing = map.get(row.key) || { value: 0, target: 0 }
      existing.value += row.value
      existing.target += row.target
      map.set(row.key, existing)
    }
  }
  return Array.from(map.entries()).map(([groupValue, { value, target }]) => {
    const variance = value - target
    return {
      group_value: groupValue,
      value_sales: value,
      target_sales: target,
      variance_sales: variance,
      variance_pct: target !== 0 ? (variance / target) * 100 : 0,
    }
  })
}

/** Brand-level: uses get_sales_by_brand (returns value+target per brand). */
export const getSalesByBrand = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
): Promise<VarianceDriverRow[]> => {
  if (timeView === 'qtd' || timeView === 'ytd') {
    const months = getMonthRange(filters, timeView)
    if (!months.length) return []

    const monthlyResults = await Promise.all(
      months.map((m) =>
        _fetchBrandsSingleMonth(valueMeasure, targetMeasure, filters, m),
      ),
    )

    return mergeGroupedRows(
      monthlyResults.map((rows) =>
        rows.map((r) => ({ key: r.brand, value: r.value, target: r.target })),
      ),
    )
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc(
    'get_sales_by_brand',
    cleanParams({
      p_value_measure: valueMeasure,
      p_target_measure: targetMeasure,
      p_division: filters.division,
      p_category: filters.category,
      p_location: filters.location,
      p_month: filters.month,
      p_time_view: timeView,
    }),
  )
  if (error) throw new Error(`get_sales_by_brand: ${error.message}`)
  return (data || []).map((row) => {
    const value = Number(row.value_measure ?? 0)
    const target = Number(row.target_measure ?? 0)
    const variance = value - target
    return {
      group_value: row.brand,
      value_sales: value,
      target_sales: target,
      variance_sales: variance,
      variance_pct: target !== 0 ? (variance / target) * 100 : 0,
    }
  })
}

/**
 * Category-level: gets the list of categories via get_filtered_categories,
 * then calls get_sales_value_target per category.
 * (Avoids get_top_category_sales which has an integer=text bug in its SQL.)
 */
export const getVarianceDriversByCategory = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
): Promise<VarianceDriverRow[]> => {
  // 1. Fetch the list of categories scoped to the current filters
  const categories = await getFilteredCategories({
    measure: valueMeasure,
    brand: filters.brand,
    division: filters.division,
    location: filters.location,
    month: filters.month,
  })

  if (!categories.length) return []

  // 2. For each category, get value + target in one call
  const rows = await Promise.all(
    categories.map(async (category) => {
      const row = await getSalesValueTarget(
        valueMeasure,
        targetMeasure,
        { ...filters, category },
        timeView,
      )
      const value = Number(row?.value_sales ?? 0)
      const target = Number(row?.target_sales ?? 0)
      const variance = value - target
      return {
        group_value: category,
        value_sales: value,
        target_sales: target,
        variance_sales: variance,
        variance_pct: target !== 0 ? (variance / target) * 100 : 0,
      }
    }),
  )

  return rows
}

/**
 * Sub-brand-level: gets the list of sub-brands via get_filtered_subbrands,
 * then calls get_sales_value_target (with p_sub_brand) per sub-brand.
 * Same reliable pattern as the category fetcher.
 */
export const getVarianceDriversBySubBrand = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
): Promise<VarianceDriverRow[]> => {
  // 1. Fetch the list of sub-brands scoped to the current filters
  const subBrands = await getFilteredSubBrands({
    measure: valueMeasure,
    brand: filters.brand,
    category: filters.category,
    division: filters.division,
    location: filters.location,
    month: filters.month,
  })

  if (!subBrands.length) return []

  // 2. For each sub-brand, get value + target in one call
  const rows = await Promise.all(
    subBrands.map(async (subBrand) => {
      const row = await getSalesValueTarget(
        valueMeasure,
        targetMeasure,
        { ...filters, sub_brand: subBrand },
        timeView,
      )
      const value = Number(row?.value_sales ?? 0)
      const target = Number(row?.target_sales ?? 0)
      const variance = value - target
      return {
        group_value: subBrand,
        value_sales: value,
        target_sales: target,
        variance_sales: variance,
        variance_pct: target !== 0 ? (variance / target) * 100 : 0,
      }
    }),
  )

  return rows
}

/** Unified entry-point: fetch variance drivers at any drill level. */
export const getVarianceDrivers = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView,
  level: DrillLevel,
): Promise<VarianceDriverRow[]> => {
  switch (level) {
    case 'brand':
      return getSalesByBrand(valueMeasure, targetMeasure, filters, timeView)
    case 'category':
      return getVarianceDriversByCategory(
        valueMeasure,
        targetMeasure,
        filters,
        timeView,
      )
    case 'sub_brand':
      return getVarianceDriversBySubBrand(
        valueMeasure,
        targetMeasure,
        filters,
        timeView,
      )
    default:
      return []
  }
}

// ---------------------------------------------------------------------------
// Top div_sub winners / losers
// Uses `get_top_div_sub_variance` RPC – groups by div_sub, ranks by variance,
// and returns the top N rows (default 5).
// ---------------------------------------------------------------------------

export const getTopDivSubVariance = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView,
  direction: 'winners' | 'losers',
  limit = 5,
): Promise<VarianceDriverRow[]> => {
  if (timeView === 'qtd' || timeView === 'ytd') {
    const months = getMonthRange(filters, timeView)
    if (!months.length) return []

    const monthlyResults = await Promise.all(
      months.map(async (m) => {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.rpc(
          'get_top_div_sub_variance',
          cleanParams({
            p_value_measure: valueMeasure,
            p_target_measure: targetMeasure,
            p_division: filters.division,
            p_brand: filters.brand,
            p_category: filters.category,
            p_sub_brand: filters.sub_brand,
            p_location: filters.location,
            p_month: m,
            p_time_view: 'monthly',
            p_direction: direction,
            p_limit: 1000,
          }),
        )
        if (error) throw new Error(`get_top_div_sub_variance: ${error.message}`)
        return (data || []).map(
          (row: {
            div_sub: string
            value_sales: number
            target_sales: number
          }) => ({
            key: row.div_sub,
            value: Number(row.value_sales ?? 0),
            target: Number(row.target_sales ?? 0),
          }),
        )
      }),
    )

    const merged = mergeGroupedRows(monthlyResults)
    merged.sort((a, b) =>
      direction === 'winners'
        ? b.variance_sales - a.variance_sales
        : a.variance_sales - b.variance_sales,
    )
    return merged.slice(0, limit)
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc(
    'get_top_div_sub_variance',
    cleanParams({
      p_value_measure: valueMeasure,
      p_target_measure: targetMeasure,
      p_division: filters.division,
      p_brand: filters.brand,
      p_category: filters.category,
      p_sub_brand: filters.sub_brand,
      p_location: filters.location,
      p_month: filters.month,
      p_time_view: timeView,
      p_direction: direction,
      p_limit: limit,
    }),
  )
  if (error) throw new Error(`get_top_div_sub_variance: ${error.message}`)
  return (data || []).map(
    (row: { div_sub: string; value_sales: number; target_sales: number }) => {
      const value = Number(row.value_sales ?? 0)
      const target = Number(row.target_sales ?? 0)
      const variance = value - target
      return {
        group_value: row.div_sub,
        value_sales: value,
        target_sales: target,
        variance_sales: variance,
        variance_pct: target !== 0 ? (variance / target) * 100 : 0,
      }
    },
  )
}

// ---------------------------------------------------------------------------
// Trend series – Actual vs Target per period
// Works for monthly/YTD/QTD (parallel calls). For total returns [].
// ---------------------------------------------------------------------------

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]

function getMonthRange(
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView,
): string[] {
  if (timeView === 'ytd') {
    const endIdx = filters.month
      ? MONTHS.indexOf(filters.month.toUpperCase())
      : new Date().getMonth()
    return endIdx >= 0 ? MONTHS.slice(0, endIdx + 1) : []
  }
  if (timeView === 'qtd') {
    const startIdx = filters.qtdStartMonth
      ? MONTHS.indexOf(filters.qtdStartMonth.toUpperCase())
      : -1
    const endIdx = filters.qtdEndMonth
      ? MONTHS.indexOf(filters.qtdEndMonth.toUpperCase())
      : -1
    if (startIdx < 0 || endIdx < 0 || startIdx > endIdx) return []
    return MONTHS.slice(startIdx, endIdx + 1)
  }
  return []
}

export const getSalesTrend = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView,
): Promise<TrendDataPoint[]> => {
  if (timeView === 'total') return []

  let periods: string[]
  if (timeView === 'monthly') {
    periods = MONTHS
  } else {
    periods = getMonthRange(filters, timeView)
    if (!periods.length) return []
  }

  const results = await Promise.all(
    periods.map(async (month) => {
      const row = await _fetchSVTSingleMonth(
        valueMeasure,
        targetMeasure,
        filters,
        month,
      )
      const value = Number(row?.value_sales ?? 0)
      const target = Number(row?.target_sales ?? 0)
      return {
        period: month,
        value_sales: value,
        target_sales: target,
        variance_sales: value - target,
      }
    }),
  )

  return results
}
