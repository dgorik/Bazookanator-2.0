'use client'

import { useCallback, useMemo } from 'react'
import { useUrlState } from '@/src/hooks/useUrlState'
import useSWR from 'swr'
import KPISection from './components/KPISection'
import BrandValueTargetChart from './components/visuals/BrandValueTargetChart'
import AnalyticsFilterBar from './components/AnalyticsFilterBar'
import TimeViewTabs from './components/TimeViewTabs'
import {
  getFilterOptions,
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
  const initialFilters = useMemo(
    () => ({
      month: ALL_OPTION,
      division: ALL_OPTION,
      brand: ALL_OPTION,
      category: ALL_OPTION,
      location: ALL_OPTION,
      valueMeasure: 'blank',
      targetMeasure: 'blank',
      valueMeasureYear: 'blank',
      targetMeasureYear: 'blank',
      timeView: 'total' as TimeView,
    }),
    [],
  )

  type FiltersState = typeof initialFilters

  const serializeFilters = useCallback(
    (value: FiltersState) => encodeURIComponent(JSON.stringify(value)),
    [],
  )

  const deserializeFilters = useCallback(
    (value: string) => {
      try {
        return JSON.parse(decodeURIComponent(value)) as FiltersState
      } catch {
        return initialFilters
      }
    },
    [initialFilters],
  )

  const [filters, setFilter] = useUrlState(
    'filters',
    initialFilters,
    serializeFilters,
    deserializeFilters,
  )

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
  }

  // Fetch filter options
  const { data: dbMeasures, isLoading: isLoadingMeasures } = useSWR(
    ['filter-options', 'measures'],
    () => getFilterOptions('measures'),
  )
  const { data: dbYears, isLoading: isLoadingYears } = useSWR(
    ['filter-options', 'year'],
    () => getFilterOptions('year'),
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

  const availableMeasures = useMemo(() => {
    if (!dbMeasures || dbMeasures.length === 0) return DEFAULT_MEASURES
    return dbMeasures.filter(Boolean)
  }, [dbMeasures])

  const valueMeasureOptions = useMemo(() => {
    return availableMeasures.filter(
      (measure) => measure != filters.targetMeasure,
    )
  }, [availableMeasures, filters.targetMeasure])

  const targetMeasureOptions = useMemo(() => {
    return availableMeasures.filter(
      (measure) => measure != filters.valueMeasure,
    )
  }, [availableMeasures, filters.valueMeasure])

  const availableYears = useMemo(() => {
    if (!dbYears || dbYears.length === 0) return DEFAULT_YEARS
    return dbYears.filter(Boolean)
  }, [dbYears])

  const addAllOption = (options: string[] | undefined) => {
    if (!options || options.length === 0) return [ALL_OPTION]
    return [ALL_OPTION, ...options.filter(Boolean)]
  }

  // Build filters object for data fetching
  const kpiFilters: SalesFilters = useMemo(
    () => ({
      measure:
        filters.valueMeasure !== 'blank' ? filters.valueMeasure : undefined,
      division: filters.division !== ALL_OPTION ? filters.division : undefined,
      brand: filters.brand !== ALL_OPTION ? filters.brand : undefined,
      category: filters.category !== ALL_OPTION ? filters.category : undefined,
      location: filters.location !== ALL_OPTION ? filters.location : undefined,
      month: filters.month !== ALL_OPTION ? filters.month : undefined,
    }),
    [
      filters.valueMeasure,
      filters.division,
      filters.brand,
      filters.category,
      filters.location,
      filters.month,
    ],
  )

  const kpiTargetFilters: SalesFilters = useMemo(
    () => ({
      ...kpiFilters,
      measure:
        filters.targetMeasure !== 'blank' ? filters.targetMeasure : undefined,
    }),
    [kpiFilters, filters.targetMeasure],
  )

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
        <TimeViewTabs
          selectedView={filters.timeView}
          onViewChange={(view) => updateFilter('timeView', view)}
        />
      </div>

      <AnalyticsFilterBar
        configs={[
          {
            label: 'Value Measure',
            value: filters.valueMeasure,
            options: valueMeasureOptions,
            onChange: (val) => updateFilter('valueMeasure', val),
            isLoading: isLoadingMeasures,
          },
          {
            label: 'Value Measure Year',
            value: filters.valueMeasureYear,
            options: availableYears,
            onChange: (val) => updateFilter('valueMeasureYear', val),
            isLoading: isLoadingYears,
          },
          {
            label: 'Target Measure',
            value: filters.targetMeasure,
            options: targetMeasureOptions,
            onChange: (val) => updateFilter('targetMeasure', val),
            isLoading: isLoadingMeasures,
          },
          {
            label: 'Target Measure Year',
            value: filters.targetMeasureYear,
            options: availableYears,
            onChange: (val) => updateFilter('targetMeasureYear', val),
            isLoading: isLoadingYears,
          },
        ]}
        currentTab={filters.timeView}
      />
      <div className="space-y-8">
        <AnalyticsFilterBar
          configs={[
            {
              label: 'Month',
              value: filters.month,
              options: addAllOption(ANALYTICS_MONTHS),
              onChange: (val) => updateFilter('month', val),
              showOnTabs: ['monthly'],
            },
            {
              label: 'Location',
              value: filters.location,
              options: addAllOption(locations),
              onChange: (val) => updateFilter('location', val),
              isLoading: isLoadingLocations,
            },
            {
              label: 'SubBrand',
              value: filters.brand,
              options: addAllOption(brands),
              onChange: (val) => updateFilter('brand', val),
              isLoading: isLoadingBrands,
            },
            {
              label: 'Category',
              value: filters.category,
              options: addAllOption(categories),
              onChange: (val) => updateFilter('category', val),
              isLoading: isLoadingCategories,
            },
            {
              label: 'Divison',
              value: filters.division,
              options: addAllOption(divisions),
              onChange: (val) => updateFilter('division', val),
              isLoading: isLoadingDivisions,
            },
          ]}
          currentTab={filters.timeView}
        />

        <KPISection
          filters={kpiFilters}
          targetFilters={kpiTargetFilters}
          timeView={filters.timeView}
        />
      </div>

      {/* Brand Value vs Target Chart */}
      <BrandValueTargetChart
        valueMeasure={filters.valueMeasure}
        valueMeasureYear={parseInt(filters.valueMeasureYear)}
        targetMeasure={filters.targetMeasure}
        targetMeasureYear={parseInt(filters.targetMeasureYear)}
        filters={{
          division:
            filters.division !== ALL_OPTION ? filters.division : undefined,
          brand: filters.brand !== ALL_OPTION ? filters.brand : undefined,
          category:
            filters.category !== ALL_OPTION ? filters.category : undefined,
          location:
            filters.location !== ALL_OPTION ? filters.location : undefined,
          month: filters.month !== ALL_OPTION ? filters.month : undefined,
        }}
        timeView={filters.timeView}
      />
    </section>
  )
}
