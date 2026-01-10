'use client'

import { RiCheckLine, RiEqualizer2Line } from '@remixicon/react'
import { cn, focusInput } from '@/src/utils/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/src/components/ui/tremor/dropdown'

interface KPISlicerProps {
  label: string
  selectedMeasure: string
  onMeasureChange: (measure: string) => void
  measures: string[]
}

export default function KPISlicer({
  label,
  selectedMeasure,
  onMeasureChange,
  measures,
}: KPISlicerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              focusInput,
              'flex items-center gap-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 focus:z-10 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 hover:dark:bg-gray-950/50',
            )}
          >
            <RiEqualizer2Line
              className="-ml-px size-4 shrink-0"
              aria-hidden={true}
            />
            {selectedMeasure || 'Select measure'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-36 overflow-y-auto min-w-36">
          <DropdownMenuLabel>Select {label}</DropdownMenuLabel>
          {measures.map((measure) => (
            <DropdownMenuItem
              key={measure}
              onClick={() => onMeasureChange(measure)}
              className={cn(
                'flex items-center justify-between gap-x-4',
                selectedMeasure === measure && 'bg-gray-100 dark:bg-gray-800',
              )}
            >
              {measure}
              {selectedMeasure === measure && (
                <RiCheckLine
                  className="size-4 shrink-0 text-emerald-500"
                  aria-hidden={true}
                />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
