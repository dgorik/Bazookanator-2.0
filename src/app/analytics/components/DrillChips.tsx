'use client'

import { RiCloseLine } from '@remixicon/react'

interface DrillChipsProps {
  selectedBrand?: string
  selectedCategory?: string
  selectedSubBrand?: string
  onClearBrand: () => void
  onClearCategory: () => void
  onClearSubBrand: () => void
  onClearAll: () => void
}

function Chip({
  label,
  value,
  onRemove,
}: {
  label: string
  value: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      {value}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={`Remove ${label} filter`}
      >
        <RiCloseLine className="size-3.5" />
      </button>
    </span>
  )
}

export default function DrillChips({
  selectedBrand,
  selectedCategory,
  selectedSubBrand,
  onClearBrand,
  onClearCategory,
  onClearSubBrand,
  onClearAll,
}: DrillChipsProps) {
  const hasAny = selectedBrand || selectedCategory || selectedSubBrand

  if (!hasAny) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Drill:
      </span>

      {selectedBrand && (
        <Chip label="Brand" value={selectedBrand} onRemove={onClearBrand} />
      )}
      {selectedCategory && (
        <Chip
          label="Category"
          value={selectedCategory}
          onRemove={onClearCategory}
        />
      )}
      {selectedSubBrand && (
        <Chip
          label="Sub-brand"
          value={selectedSubBrand}
          onRemove={onClearSubBrand}
        />
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs font-medium text-gray-500 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      >
        Clear drill
      </button>
    </div>
  )
}
