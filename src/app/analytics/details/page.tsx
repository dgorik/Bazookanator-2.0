'use client'

import { DataTable } from '@/src/components/ui/data-table/DataTable'
import { columns } from '@/src/components/ui/data-table/columns'
import { usage } from '@/src/data/usage'

export default function Details() {
  // const { _data, _error } = useSWR('raw-data', rawDataFetcher)
  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Details
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <DataTable data={usage} columns={columns} />
      </div>
    </>
  )
}
