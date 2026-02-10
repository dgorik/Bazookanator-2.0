import { createClient } from '@/src/lib/client/supabase/client'

/**
 * Get Supabase client instance.
 * Uses browser client for client-side usage (called from useSWR in client components).
 * Note: Client creation is lightweight - Supabase clients are just wrappers.
 * We create a new instance per call to ensure fresh state, but extract to helper
 * to avoid repetition and allow easy switching to server client if needed.
 */
function getSupabaseClient() {
  return createClient()
}
// Generic filter options fetcher - gets unique values for any column
export const getFilterOptions = async (columnName: string) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_filter_options', {
    column_name: columnName,
  })
  if (error) throw error
  return data || []
}

// Filter types
export interface SalesFilters {
  measure?: string
  year?: string
  division?: string
  brand?: string
  category?: string
  location?: string
  month?: string
}

export type TimeView = 'monthly' | 'quarterly' | 'total'

// Get aggregated sales data with multiple filters and time view
export const getSalesData = async (
  filters: SalesFilters,
  timeView: TimeView = 'total',
) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'fetchers.ts:43',
      message: 'getSalesData called',
      data: {
        filters,
        timeView,
        p_measure: filters.measure,
        p_measureType: typeof filters.measure,
      },
      timestamp: Date.now(),
      hypothesisId: 'A,B,C',
    }),
  }).catch(() => {})
  // #endregion
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_sales_by_filters', {
    p_measure: filters.measure,
    p_division: filters.division,
    p_brand: filters.brand,
    p_category: filters.category,
    p_location: filters.location,
    p_month: filters.month,
    p_time_view: timeView,
  })
  if (error) throw error
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c6b6e430-27ac-4abb-adec-2e56faa46b3e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'fetchers.ts:57',
      message: 'getSalesData result',
      data: { data, dataType: typeof data, dataIsNull: data === null },
      timestamp: Date.now(),
      hypothesisId: 'A,C',
    }),
  }).catch(() => {})
  // #endregion
  return data
}

// Get sales data grouped by brand with value and target measures
// Returns array of { brand: string, value_measure: number, target_measure: number }
export const getSalesByBrand = async (
  valueMeasure: string,
  valueMeasureYear: number,
  targetMeasure: string,
  targetMeasureYear: number,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_sales_by_brand', {
    p_value_measure: valueMeasure,
    p_value_measure_year: valueMeasureYear,
    p_target_measure: targetMeasure,
    p_target_measure_year: targetMeasureYear,
    p_division: filters.division,
    p_category: filters.category,
    p_location: filters.location,
    p_month: filters.month,
    p_time_view: timeView,
  })
  if (error) throw error
  return data || []
}

// Get top category sales
// Returns { category: string, sales: number } or null
export const getTopCategorySales = async (
  filters: SalesFilters,
  timeView: TimeView = 'total',
) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_top_category_sales', {
    p_measure: filters.measure,
    p_year: filters.year,
    p_division: filters.division,
    p_brand: filters.brand,
    p_location: filters.location,
    p_month: filters.month,
    p_time_view: timeView,
  })
  if (error) throw error
  const result = data as { category: string; sales: number }[] | null
  return result && result.length > 0 ? result[0] : null
}

// Get top subbrand sales
// Returns { sub_brand: string, sales: number } or null
export const getTopSubBrandSales = async (
  filters: SalesFilters,
  timeView: TimeView = 'total',
) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_top_subbrand_sales', {
    p_measure: filters.measure,
    p_year: filters.year,
    p_division: filters.division,
    p_brand: filters.brand,
    p_category: filters.category,
    p_location: filters.location,
    p_month: filters.month,
    p_time_view: timeView,
  })
  if (error) throw error
  const result = data as { sub_brand: string; sales: number }[] | null
  return result && result.length > 0 ? result[0] : null
}
