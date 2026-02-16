'use client'

import { useMemo, useReducer } from 'react'
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
  valueMeasure: '2025 Plan V4',
  targetMeasure: '2024 Actuals V2',
  timeView: 'total' as TimeView,
}

type FiltersState = typeof initialFilters

type DrillDownState = {
  selectedBrand?: string
  selectedCategory?: string
  selectedSubBrand?: string
}

const InitialDrillDownState: DrillDownState = {
  selectedBrand: undefined,
  selectedCategory: undefined,
  selectedSubBrand: undefined,
}

type Action =
  | { type: 'SELECT_BRAND'; payload: string }
  | { type: 'SELECT_CATEGORY'; payload: string }
  | { type: 'SELECT_SUBBRAND'; payload: string }
  | { type: 'CLEAR_BRAND' }
  | { type: 'CLEAR_CATEGORY' }
  | { type: 'CLEAR_SUBBRAND' }
  | { type: 'CLEAR_ALL' }

const serializeFilters = (value: FiltersState) => {
  return encodeURIComponent(JSON.stringify(value)) //here we are converting a string into an URL
}

const deserializeFilters = (value: string): FiltersState => {
  try {
    return JSON.parse(decodeURIComponent(value)) as FiltersState
  } catch {
    return initialFilters
  }
} //here we are converting URl back into original value

const normalizeOption = (value: string) =>
  value !== ALL_OPTION ? value : undefined

const withAllOption = (options?: string[]) =>
  !options?.length ? [ALL_OPTION] : [ALL_OPTION, ...options.filter(Boolean)]

const drillDownReducer = (state: DrillDownState, action: Action) => {
  switch (action.type) {
    case 'SELECT_BRAND':
      return {
        selectedBrand: action.payload,
        selectedCategory: undefined,
        selectedSubBrand: undefined,
      }
    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        selectedSubBrand: undefined,
      }
    case 'SELECT_SUBBRAND':
      return {
        ...state,
        selectedSubBrand: action.payload,
      }
    case 'CLEAR_BRAND':
    case 'CLEAR_ALL':
      return {
        selectedBrand: undefined,
        selectedCategory: undefined,
        selectedSubBrand: undefined,
      }
    case 'CLEAR_CATEGORY':
      return {
        ...state,
        selectedCategory: undefined,
        selectedSubBrand: undefined,
      }
    case 'CLEAR_SUBBRAND':
      return {
        ...state,
        selectedSubBrand: undefined,
      }
    default:
      return state
  }
}
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
  const [state, dispatch] = useReducer(drillDownReducer, InitialDrillDownState)

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
          selectedBrand={state.selectedBrand}
          selectedCategory={state.selectedCategory}
          selectedSubBrand={state.selectedSubBrand}
          onClearBrand={() => dispatch({ type: 'CLEAR_BRAND' })}
          onClearCategory={() => dispatch({ type: 'CLEAR_CATEGORY' })}
          onClearSubBrand={() => dispatch({ type: 'CLEAR_SUBBRAND' })}
          onClearAll={() => dispatch({ type: 'CLEAR_ALL' })}
        />

        {/* ---- Main grid: Variance Drivers (left) + Top 5 div_sub (right) ---- */}
        <div className="flex flex-col md:flex-row gap-2">
          <VarianceDriversCard
            valueMeasure={valueMeasure}
            targetMeasure={targetMeasure}
            filters={normalizedFilters}
            timeView={filters.timeView}
            selectedBrand={state.selectedBrand}
            selectedCategory={state.selectedCategory}
            onBrandSelect={(brandValue: string) =>
              dispatch({ type: 'SELECT_BRAND', payload: brandValue })
            }
            onCategorySelect={(categoryValue: string) =>
              dispatch({ type: 'SELECT_CATEGORY', payload: categoryValue })
            }
            onSubBrandSelect={(subbrandValue: string) =>
              dispatch({ type: 'SELECT_SUBBRAND', payload: subbrandValue })
            }
          />
          <TopDivSubCard
            valueMeasure={valueMeasure}
            targetMeasure={targetMeasure}
            filters={normalizedFilters}
            timeView={filters.timeView}
            selectedBrand={state.selectedBrand}
            selectedCategory={state.selectedCategory}
            selectedSubBrand={state.selectedSubBrand}
          />
        </div>
      </section>

      {/* ---- Chat assistant (floating) ---- */}
      <ChatBox />
    </div>
  )
}
