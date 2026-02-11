import { createClient } from '@/src/lib/client/supabase/client'

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
// Get both value and target sales in one call
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
    p_location: filters.location,
    p_month: filters.month,
    p_time_view: timeView,
  })
  if (error) throw error
  // Returns first row: { value_sales: number, target_sales: number }
  return data && data.length > 0 ? data[0] : null
}

// Get filtered brand options
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

// Get filtered category options
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
