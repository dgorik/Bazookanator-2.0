'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import KPICard from './components/visuals/KPICard'
import BrandValueTargetChart from './components/visuals/BrandValueTargetChart'
import AnalyticsFilterBar from './components/AnalyticsFilterBar'
import TimeViewTabs from './components/TimeViewTabs'
import {
  getFilterOptions,
  getSalesData,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'
import {
  DEFAULT_MEASURES,
  ANALYTICS_MONTHS,
  DEFAULT_YEARS,
} from '@/src/data/filter_data'

const ALL_OPTION = 'All'

export default function MemberClient() {
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(ALL_OPTION)
  const [selectedDivision, setSelectedDivision] = useState(ALL_OPTION)
  const [selectedBrand, setSelectedBrand] = useState(ALL_OPTION)
  const [selectedCategory, setSelectedCategory] = useState(ALL_OPTION)
  const [selectedLocation, setSelectedLocation] = useState(ALL_OPTION)
  const [valueMeasure, setValueMeasure] = useState(DEFAULT_MEASURES[0])
  const [targetMeasure, setTargetMeasure] = useState(
    DEFAULT_MEASURES[1] || DEFAULT_MEASURES[0],
  )
  const [valueMeasureYear, setValueMeasureYear] = useState('2025')
  const [targetMeasureYear, setTargetMeasureYear] = useState('2025')

  // Time view state
  const [timeView, setTimeView] = useState<TimeView>('total')

  // Fetch filter options
  const { data: dbMeasures, isLoading: isLoadingMeasures } = useSWR(
    'measures',
    () => getFilterOptions('measures'),
  )
  const { data: dbYears, isLoading: isLoadingYears } = useSWR('year', () =>
    getFilterOptions('year'),
  )
  const { data: divisions, isLoading: isLoadingDivisions } = useSWR(
    ['filter-options', 'division'],
    () => getFilterOptions('division'),
  )
  const { data: brands, isLoading: isLoadingBrands } = useSWR(
    ['filter-options', 'brand'],
    () => getFilterOptions('brand'),
  )
  const { data: categories, isLoading: isLoadingCategories } = useSWR(
    ['filter-options', 'category'],
    () => getFilterOptions('category'),
  )
  const { data: locations, isLoading: isLoadingLocations } = useSWR(
    ['filter-options', 'location'],
    () => getFilterOptions('location'),
  )

  // Process filter options with "All" option
  const availableMeasures = useMemo(() => {
    if (!dbMeasures || dbMeasures.length === 0) return DEFAULT_MEASURES
    return dbMeasures.filter(Boolean)
  }, [dbMeasures])

  const availableYears = useMemo(() => {
    if (!dbYears || dbYears.length === 0) return DEFAULT_YEARS
    return dbYears.filter(Boolean)
  }, [dbYears])

  const addAllOption = (options: string[] | undefined) => {
    if (!options || options.length === 0) return [ALL_OPTION]
    return [ALL_OPTION, ...options.filter(Boolean)]
  }

  // Build filters object for data fetching
  const filters: SalesFilters = useMemo(
    () => ({
      measure: valueMeasure,
      division: selectedDivision !== ALL_OPTION ? selectedDivision : undefined,
      brand: selectedBrand !== ALL_OPTION ? selectedBrand : undefined,
      category: selectedCategory !== ALL_OPTION ? selectedCategory : undefined,
      location: selectedLocation !== ALL_OPTION ? selectedLocation : undefined,
      month: selectedMonth !== ALL_OPTION ? selectedMonth : undefined,
    }),
    [
      valueMeasure,
      selectedDivision,
      selectedBrand,
      selectedCategory,
      selectedLocation,
      selectedMonth,
    ],
  )

  const targetFilters: SalesFilters = useMemo(
    () => ({
      ...filters,
      measure: targetMeasure,
    }),
    [filters, targetMeasure],
  )

  // Fetch sales data
  const { data: valueData, isLoading: isLoadingValue } = useSWR(
    ['sales-value', filters, timeView],
    () => getSalesData(filters, timeView),
  )

  const { data: targetData, isLoading: isLoadingTarget } = useSWR(
    ['sales-target', targetFilters, timeView],
    () => getSalesData(targetFilters, timeView),
  )

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const val = Number(valueData) || 0
    const tgt = Number(targetData) || 0
    const growth = tgt !== 0 ? ((val - tgt) / tgt) * 100 : 0

    return {
      value: val,
      target: tgt,
      growth: growth,
    }
  }, [valueData, targetData])

  const isLoading = isLoadingValue || isLoadingTarget

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sales and growth stats for anonymous inc.
          </p>
        </div>
        <TimeViewTabs selectedView={timeView} onViewChange={setTimeView} />
      </div>

      <AnalyticsFilterBar
        configs={[
          {
            label: 'Month',
            value: selectedMonth,
            options: addAllOption(ANALYTICS_MONTHS),
            onChange: setSelectedMonth,
            showOnTabs: ['monthly'],
          },
          {
            label: 'Division',
            value: selectedDivision,
            options: addAllOption(divisions),
            onChange: setSelectedDivision,
            isLoading: isLoadingDivisions,
          },
          {
            label: 'Brand',
            value: selectedBrand,
            options: addAllOption(brands),
            onChange: setSelectedBrand,
            isLoading: isLoadingBrands,
          },
          {
            label: 'Category',
            value: selectedCategory,
            options: addAllOption(categories),
            onChange: setSelectedCategory,
            isLoading: isLoadingCategories,
          },
          {
            label: 'Location',
            value: selectedLocation,
            options: addAllOption(locations),
            onChange: setSelectedLocation,
            isLoading: isLoadingLocations,
          },
        ]}
        currentTab={timeView}
      />

      <AnalyticsFilterBar
        configs={[
          {
            label: 'Value Measure',
            value: valueMeasure,
            options: availableMeasures,
            onChange: setValueMeasure,
            isLoading: isLoadingMeasures,
          },
          {
            label: 'Value Measure Year',
            value: valueMeasureYear,
            options: availableYears,
            onChange: setValueMeasureYear,
            isLoading: isLoadingYears,
          },
          {
            label: 'Target Measure',
            value: targetMeasure,
            options: availableMeasures,
            onChange: setTargetMeasure,
            isLoading: isLoadingMeasures,
          },
          {
            label: 'Target Measure Year',
            value: targetMeasureYear,
            options: availableYears,
            onChange: setTargetMeasureYear,
            isLoading: isLoadingYears,
          },
        ]}
        currentTab={timeView}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KPICard
          title={
            timeView === 'monthly'
              ? 'Monthly Sales'
              : timeView === 'quarterly'
                ? 'Quarterly Sales'
                : 'Total Sales'
          }
          value={kpiMetrics.value}
          target={kpiMetrics.target}
          growth={kpiMetrics.growth}
        />
      </div>

      {/* Brand Value vs Target Chart */}
      <BrandValueTargetChart
        valueMeasure={valueMeasure}
        targetMeasure={targetMeasure}
        filters={{
          division:
            selectedDivision !== ALL_OPTION ? selectedDivision : undefined,
          brand: selectedBrand !== ALL_OPTION ? selectedBrand : undefined,
          category:
            selectedCategory !== ALL_OPTION ? selectedCategory : undefined,
          location:
            selectedLocation !== ALL_OPTION ? selectedLocation : undefined,
          month: selectedMonth !== ALL_OPTION ? selectedMonth : undefined,
        }}
        timeView={timeView}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading data...
          </p>
        </div>
      )}
    </section>
  )
}
