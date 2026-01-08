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

// Raw Data Fetcher
export const rawDataFetcher = async () => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('OP Database').select('*')
  return {
    user: data,
    isLoading: false,
    isError: error,
  }
}

export const getMeasures = async () => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_measures')
  if (error) throw error
  return data
}

export const getMeasureTotal = async (measureName: string) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_measure_total', {
    measure_name: measureName,
  })
  if (error) throw error
  return data
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
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_sales_by_filters', {
    p_measure: filters.measure || null,
    p_division: filters.division || null,
    p_brand: filters.brand || null,
    p_category: filters.category || null,
    p_location: filters.location || null,
    p_month: filters.month || null,
    p_time_view: timeView,
  })
  if (error) throw error
  return data
}

// Get sales data grouped by brand with value and target measures
// Returns array of { brand: string, value_measure: number, target_measure: number }
export const getSalesByBrand = async (
  valueMeasure: string,
  targetMeasure: string,
  filters: Omit<SalesFilters, 'measure'>,
  timeView: TimeView = 'total',
) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_sales_by_brand', {
    p_value_measure: valueMeasure,
    p_target_measure: targetMeasure,
    p_division: filters.division || null,
    p_category: filters.category || null,
    p_location: filters.location || null,
    p_month: filters.month || null,
    p_time_view: timeView,
  })
  if (error) throw error
  return data || []
}
