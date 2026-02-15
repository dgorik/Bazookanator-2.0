'use client'

import { useMemo, useState } from 'react'
import { useUrlState } from '@/src/hooks/useUrlState'
import useSWR from 'swr'
import ChatBox from './components/ChatBox'
import AnalyticsFilterBar from './components/AnalyticsFilterBar'
import TimeViewTabs from './components/TimeViewTabs'
import HeadlineKPI from './components/HeadlineKPI'
import DrillChips from './components/DrillChips'
import VarianceDriversCard from './components/visuals/VarianceDriversCard'
import TopDivSubCard from './components/visuals/TopDivSubCard'
import {
  getFilterOptions,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'
import { DEFAULT_MEASURES, ANALYTICS_MONTHS } from '@/src/data/filter_data'

// ---------------------------------------------------------------------------
// Constants & URL state helpers
// ---------------------------------------------------------------------------

const ALL_OPTION = 'All'
const BLANK = 'blank'

const initialFilters = {
  month: ALL_OPTION,
  division: ALL_OPTION,
  valueMeasure: BLANK,
  targetMeasure: BLANK,
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

const withAllOption = (options?: string[]) =>
  !options?.length ? [ALL_OPTION] : [ALL_OPTION, ...options.filter(Boolean)]

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AnalyticsDashboard() {
  // ---- Sticky URL filters ----
  const [filters, setFilter] = useUrlState(
    'filters',
    initialFilters,
    serializeFilters,
    deserializeFilters,
  )

  const updateFilter = (key: keyof FiltersState, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
  }

  // ---- Drill selections (local state) ----
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedSubBrand, setSelectedSubBrand] = useState<string | undefined>()

  // Waterfall: Brand → Category → Sub-brand
  const selectBrand = (brand: string) => {
    setSelectedBrand(brand)
    setSelectedCategory(undefined)
    setSelectedSubBrand(undefined)
  }

  const selectCategory = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubBrand(undefined)
  }

  const selectSubBrand = (subBrand: string) => {
    setSelectedSubBrand(subBrand)
  }

  // Clear actions (remove level + everything below it)
  const clearBrand = () => {
    setSelectedBrand(undefined)
    setSelectedCategory(undefined)
    setSelectedSubBrand(undefined)
  }

  const clearCategory = () => {
    setSelectedCategory(undefined)
    setSelectedSubBrand(undefined)
  }

  const clearSubBrand = () => {
    setSelectedSubBrand(undefined)
  }

  const clearAllDrill = () => {
    setSelectedBrand(undefined)
    setSelectedCategory(undefined)
    setSelectedSubBrand(undefined)
  }

  // ---- Filter option fetching ----
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

  // ---- Normalized filters (All → undefined) shared across components ----
  const normalizedFilters: Omit<SalesFilters, 'measure'> = useMemo(
    () => ({
      division: normalizeOption(filters.division),
      month: normalizeOption(filters.month),
    }),
    [filters.division, filters.month],
  )

  const valueMeasure =
    filters.valueMeasure !== BLANK ? filters.valueMeasure : undefined
  const targetMeasure =
    filters.targetMeasure !== BLANK ? filters.targetMeasure : undefined

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full">
      <section className="space-y-6">
        {/* ---- Header ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Sales vs Target — variance analysis
            </p>
          </div>
          <TimeViewTabs
            selectedView={filters.timeView}
            onViewChange={(view) => updateFilter('timeView', view)}
          />
        </div>

        {/* ---- Filters: Row 1 – Measures ---- */}
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

        {/* ---- Filters: Row 2 – Scope ---- */}
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
        />

        {/* ---- Headline KPI (single card) ---- */}
        <HeadlineKPI
          valueMeasure={valueMeasure}
          targetMeasure={targetMeasure}
          filters={normalizedFilters}
          timeView={filters.timeView}
        />

        {/* ---- Drill chips ---- */}
        <DrillChips
          selectedBrand={selectedBrand}
          selectedCategory={selectedCategory}
          selectedSubBrand={selectedSubBrand}
          onClearBrand={clearBrand}
          onClearCategory={clearCategory}
          onClearSubBrand={clearSubBrand}
          onClearAll={clearAllDrill}
        />

        {/* ---- Main grid: Variance Drivers (left) + Top 5 div_sub (right) ---- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <VarianceDriversCard
            valueMeasure={valueMeasure}
            targetMeasure={targetMeasure}
            filters={normalizedFilters}
            timeView={filters.timeView}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            onBrandSelect={selectBrand}
            onCategorySelect={selectCategory}
            onSubBrandSelect={selectSubBrand}
          />

          <TopDivSubCard
            valueMeasure={valueMeasure}
            targetMeasure={targetMeasure}
            filters={normalizedFilters}
            timeView={filters.timeView}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedSubBrand={selectedSubBrand}
          />
        </div>
      </section>

      {/* ---- Chat assistant (floating) ---- */}
      <ChatBox />
    </div>
  )
}
