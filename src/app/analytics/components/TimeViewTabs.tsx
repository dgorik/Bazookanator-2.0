'use client'

import { cn } from '@/src/utils/utils'
import type { TimeView } from '@/src/lib/fetcher/fetchers'

interface TimeViewTabsProps {
  selectedView: TimeView
  onViewChange: (view: TimeView) => void
}

const tabs: { id: TimeView; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'total', label: 'Total' },
]

export default function TimeViewTabs({
  selectedView,
  onViewChange,
}: TimeViewTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onViewChange(tab.id)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            selectedView === tab.id
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
