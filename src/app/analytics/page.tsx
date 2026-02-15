'use client'

import { useMemo, useState } from 'react'
import { useUrlState } from '@/src/hooks/useUrlState'
import useSWR from 'swr'
import KPISection from './components/KPISection'
import ChatBox from './components/ChatBox'
import BrandValueTargetChart from './components/visuals/BrandValueTargetChart'
import AnalyticsFilterBar from './components/AnalyticsFilterBar'
import TimeViewTabs from './components/TimeViewTabs'
import {
  getFilterOptions,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'
import { DEFAULT_MEASURES, ANALYTICS_MONTHS } from '@/src/data/filter_data'

const ALL_OPTION = 'All'
const BLANK = 'blank'

const initialFilters = {
  month: ALL_OPTION,
  division: ALL_OPTION,
  brand: ALL_OPTION,
  category: ALL_OPTION,
  location: ALL_OPTION,
  valueMeasure: BLANK,
  targetMeasure: BLANK,
  valueMeasureYear: BLANK,
  targetMeasureYear: BLANK,
  timeView: 'total' as TimeView,
}

type FiltersState = typeof initialFilters

const serializeFilters = (value: FiltersState) =>
  encodeURIComponent(JSON.stringify(value))

const deserializeFilters = (value: string): FiltersState => {
  try {
    return JSON.parse(decodeURIComponent(value)) as FiltersState
  } catch {
    return initialFilters
  }
}

const normalizeOption = (value: string) =>
  value !== ALL_OPTION ? value : undefined

const safeInt = (value: string) => {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : 0
}

const withAllOption = (options?: string[]) =>
  !options?.length ? [ALL_OPTION] : [ALL_OPTION, ...options.filter(Boolean)]

export default function MemberClient() {
  const [filters, setFilter] = useUrlState(
    'filters',
    initialFilters,
    serializeFilters,
    deserializeFilters,
  )

  const [selectedBrand, setSelectedBrand] = useState<string | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>()

  const setLocationWaterfall = (location: string | undefined) => {
    setSelectedLocation(location)
    setSelectedBrand(undefined)
    setSelectedCategory(undefined)
  }

  const setBrandWaterfall = (brand: string | undefined) => {
    setSelectedBrand(brand)
    setSelectedCategory(undefined)
  }

  const setCategoryWaterfall = (category: string | undefined) => {
    setSelectedCategory(category)
  }

  const updateFilter = (key: keyof FiltersState, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
  }

  const resetLocation = () => setLocationWaterfall(undefined)
  const resetBrand = () => setBrandWaterfall(undefined)
  const resetCategory = () => setCategoryWaterfall(undefined)

  // const resetAllWaterfall = () => {
  //   setSelectedLocation(undefined)
  //   setSelectedBrand(undefined)
  //   setSelectedCategory(undefined)
  // }

  const { data: dbMeasures, isLoading: isLoadingMeasures } = useSWR(
    ['filter-options', 'measures'],
    () => getFilterOptions('measures'),
  )
  const { data: divisions, isLoading: isLoadingDivisions } = useSWR(
    ['filter-options', 'division'],
    () => getFilterOptions('division'),
  )

  const availableMeasures = useMemo(
    () => (dbMeasures?.length ? dbMeasures.filter(Boolean) : DEFAULT_MEASURES),
    [dbMeasures],
  )

  const valueMeasureOptions = useMemo(
    () => availableMeasures.filter((m) => m !== filters.targetMeasure),
    [availableMeasures, filters.targetMeasure],
  )

  const targetMeasureOptions = useMemo(
    () => availableMeasures.filter((m) => m !== filters.valueMeasure),
    [availableMeasures, filters.valueMeasure],
  )

  // shared normalized filters for KPI + chart
  const normalizedFilters = useMemo(
    () => ({
      division: normalizeOption(filters.division),
      brand: normalizeOption(filters.brand),
      category: normalizeOption(filters.category),
      location: normalizeOption(filters.location),
      month: normalizeOption(filters.month),
    }),
    [
      filters.division,
      filters.brand,
      filters.category,
      filters.location,
      filters.month,
    ],
  )

  const kpiFilters: SalesFilters = useMemo(
    () => ({
      ...normalizedFilters,
      measure:
        filters.valueMeasure !== BLANK ? filters.valueMeasure : undefined,
    }),
    [normalizedFilters, filters.valueMeasure],
  )

  const kpiTargetFilters: SalesFilters = useMemo(
    () => ({
      ...normalizedFilters,
      measure:
        filters.targetMeasure !== BLANK ? filters.targetMeasure : undefined,
    }),
    [normalizedFilters, filters.targetMeasure],
  )

  return (
    <div className="w-full">
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

        {/* Measure filters */}
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
              label: 'Target Measure',
              value: filters.targetMeasure,
              options: targetMeasureOptions,
              onChange: (val) => updateFilter('targetMeasure', val),
              isLoading: isLoadingMeasures,
            },
          ]}
          currentTab={filters.timeView}
        />

        <div className="space-y-8">
          {/* Dimension filters + brand/category selectors */}
          <AnalyticsFilterBar
            configs={[
              {
                label: 'Month',
                value: filters.month,
                options: withAllOption(ANALYTICS_MONTHS),
                onChange: (val) => updateFilter('month', val),
                showOnTabs: ['monthly'],
              },
              {
                label: 'Division',
                value: filters.division,
                options: withAllOption(divisions),
                onChange: (val) => updateFilter('division', val),
                isLoading: isLoadingDivisions,
              },
            ]}
            currentTab={filters.timeView}
            filters={kpiFilters}
            selectedLocation={selectedLocation}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            onLocationChange={setLocationWaterfall}
            onBrandChange={setBrandWaterfall}
            onCategoryChange={setCategoryWaterfall}
          />

          <KPISection
            filters={kpiFilters}
            targetFilters={kpiTargetFilters}
            selectedLocation={selectedLocation}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            onResetLocation={resetLocation}
            onResetBrand={resetBrand}
            onResetCategory={resetCategory}
            timeView={filters.timeView}
          />
        </div>

        <BrandValueTargetChart
          valueMeasure={filters.valueMeasure}
          valueMeasureYear={safeInt(filters.valueMeasureYear)}
          targetMeasure={filters.targetMeasure}
          targetMeasureYear={safeInt(filters.targetMeasureYear)}
          filters={normalizedFilters}
          timeView={filters.timeView}
        />
      </section>

      <ChatBox />
    </div>
  )
}
