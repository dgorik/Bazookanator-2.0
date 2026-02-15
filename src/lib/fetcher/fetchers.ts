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
}

export type TimeView = 'monthly' | 'quarterly' | 'total'

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

export const getSalesValueTarget = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
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

/** Brand-level: uses get_sales_by_brand (returns value+target per brand). */
export const getSalesByBrand = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
): Promise<VarianceDriverRow[]> => {
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
// NOTE: Requires a `get_top_div_sub_variance` RPC to be created in Supabase.
// Signature should accept the same filters + p_direction + p_limit and return
// { div_sub, value_sales, target_sales } rows grouped by div_sub.
// For now this returns an empty array.
// ---------------------------------------------------------------------------

export const getTopDivSubVariance = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView,
  direction: 'winners' | 'losers',
): Promise<VarianceDriverRow[]> => {
  // TODO: Replace with supabase.rpc('get_top_div_sub_variance', { ... })
  // once the RPC is created.
  void valueMeasure
  void targetMeasure
  void filters
  void timeView
  void direction
  return []
}

// ---------------------------------------------------------------------------
// Trend series – Actual vs Target per period
// Works for monthly (12 parallel calls). For quarterly/total returns [].
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

export const getSalesTrend = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView,
): Promise<TrendDataPoint[]> => {
  if (timeView === 'total') return []

  const periods = MONTHS

  const results = await Promise.all(
    periods.map(async (month) => {
      const row = await getSalesValueTarget(
        valueMeasure,
        targetMeasure,
        { ...filters, month },
        'monthly',
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

  if (timeView === 'quarterly') {
    const quarters: TrendDataPoint[] = []
    for (let q = 0; q < 4; q++) {
      const slice = results.slice(q * 3, q * 3 + 3)
      const value = slice.reduce((s, r) => s + r.value_sales, 0)
      const target = slice.reduce((s, r) => s + r.target_sales, 0)
      quarters.push({
        period: `Q${q + 1}`,
        value_sales: value,
        target_sales: target,
        variance_sales: value - target,
      })
    }
    return quarters
  }

  return results
}
