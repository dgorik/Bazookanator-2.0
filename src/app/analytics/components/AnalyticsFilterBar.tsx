'use client'

import KPISlicer from './visuals/KPISlicer'
import useSWR from 'swr'
import {
  getFilteredBrands,
  getFilteredCategories,
  type TimeView,
  type SalesFilters,
} from '@/src/lib/fetcher/fetchers'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/tremor/select'

interface FilterConfig {
  label: string
  value: string
  options: string[]
  onChange: (val: string) => void
  isLoading?: boolean
  showOnTabs?: TimeView[]
}

interface AnalyticsFilterBarProps {
  configs: FilterConfig[]
  currentTab: TimeView
  filters?: SalesFilters
  selectedBrand?: string
  selectedCategory?: string
  onBrandChange?: (brand: string | undefined) => void
  onCategoryChange?: (category: string | undefined) => void
}

export default function AnalyticsFilterBar({
  configs,
  currentTab,
  filters,
  selectedBrand,
  selectedCategory,
  onBrandChange,
  onCategoryChange,
}: AnalyticsFilterBarProps) {
  const visibleConfigs = configs.filter(
    (config) => !config.showOnTabs || config.showOnTabs.includes(currentTab),
  )

  const shouldShowBrandCategory =
    !!filters && !!onBrandChange && !!onCategoryChange

  const { data: availableBrands } = useSWR(
    shouldShowBrandCategory && filters.measure
      ? ['filtered-brands', filters]
      : null,
    () => getFilteredBrands(filters!),
  )

  const { data: availableCategories } = useSWR(
    shouldShowBrandCategory && filters.measure
      ? ['filtered-categories', filters, selectedBrand]
      : null,
    () => getFilteredCategories({ ...filters!, brand: selectedBrand }),
  )

  const handleBrandChange = (value: string) => {
    onBrandChange?.(value || undefined)
  }

  const handleCategoryChange = (value: string) => {
    onCategoryChange?.(value || undefined)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      {visibleConfigs.map((config, index) => (
        <div key={config.label} className="flex items-center gap-4">
          <KPISlicer
            label={config.label}
            selectedMeasure={config.value}
            onMeasureChange={config.onChange}
            measures={config.isLoading ? ['Loading...'] : config.options}
          />
          {index < visibleConfigs.length - 1 && (
            <div className="hidden h-6 w-px bg-gray-200 dark:bg-gray-800 sm:block" />
          )}
        </div>
      ))}

      {shouldShowBrandCategory && (
        <>
          <div className="hidden h-6 w-px bg-gray-200 dark:bg-gray-800 sm:block" />

          <div className="min-w-[180px]">
            <Select
              value={selectedBrand ?? ''}
              onValueChange={handleBrandChange}
              disabled={!filters?.measure}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {(availableBrands ?? []).map((brand: string) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select
              value={selectedCategory ?? ''}
              onValueChange={handleCategoryChange}
              disabled={!filters?.measure}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {(availableCategories ?? []).map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}
