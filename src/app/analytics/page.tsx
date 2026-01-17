'use client'

import { useMemo } from 'react'
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
  // Filter state
  const [selectedMonth, setSelectedMonth] = useUrlState('month', ALL_OPTION)
  const [selectedDivision, setSelectedDivision] = useUrlState(
    'division',
    ALL_OPTION,
  )
  const [selectedBrand, setSelectedBrand] = useUrlState('brand', ALL_OPTION)
  const [selectedCategory, setSelectedCategory] = useUrlState(
    'category',
    ALL_OPTION,
  )
  const [selectedLocation, setSelectedLocation] = useUrlState(
    'location',
    ALL_OPTION,
  )

  const [valueMeasure, setValueMeasure] = useUrlState('valueMeasure', 'blank')
  const [targetMeasure, setTargetMeasure] = useUrlState(
    'targetMeasure',
    'blank',
  )
  const [valueMeasureYear, setValueMeasureYear] = useUrlState(
    'valueMeasureYear',
    'blank',
  )
  const [targetMeasureYear, setTargetMeasureYear] = useUrlState(
    'targetMeasureYear',
    'blank',
  )

  // Time view state (monthly | quarterly | total)
  const [timeView, setTimeView] = useUrlState<TimeView>('timeView', 'total')

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
    return availableMeasures.filter((measure) => measure != targetMeasure)
  }, [availableMeasures, targetMeasure])

  const targetMeasureOptions = useMemo(() => {
    return availableMeasures.filter((measure) => measure != valueMeasure)
  }, [availableMeasures, valueMeasure])

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
      year: valueMeasureYear,
      division: selectedDivision !== ALL_OPTION ? selectedDivision : undefined,
      brand: selectedBrand !== ALL_OPTION ? selectedBrand : undefined,
      category: selectedCategory !== ALL_OPTION ? selectedCategory : undefined,
      location: selectedLocation !== ALL_OPTION ? selectedLocation : undefined,
      month: selectedMonth !== ALL_OPTION ? selectedMonth : undefined,
    }),
    [
      valueMeasure,
      valueMeasureYear,
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
      year: targetMeasureYear,
    }),
    [filters, targetMeasure, targetMeasureYear],
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
        <TimeViewTabs selectedView={timeView} onViewChange={setTimeView} />
      </div>

      <AnalyticsFilterBar
        configs={[
          {
            label: 'Value Measure',
            value: valueMeasure,
            options: valueMeasureOptions,
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
            options: targetMeasureOptions,
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
      <div className="space-y-8">
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
              label: 'Location',
              value: selectedLocation,
              options: addAllOption(locations),
              onChange: setSelectedLocation,
              isLoading: isLoadingLocations,
            },
            {
              label: 'SubBrand',
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
              label: 'Divison',
              value: selectedDivision,
              options: addAllOption(divisions),
              onChange: setSelectedDivision,
              isLoading: isLoadingDivisions,
            },
          ]}
          currentTab={timeView}
        />

        <KPISection
          filters={filters}
          targetFilters={targetFilters}
          timeView={timeView}
        />
      </div>

      {/* Brand Value vs Target Chart */}
      <BrandValueTargetChart
        valueMeasure={valueMeasure}
        valueMeasureYear={parseInt(valueMeasureYear)}
        targetMeasure={targetMeasure}
        targetMeasureYear={parseInt(targetMeasureYear)}
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
    </section>
  )
}
