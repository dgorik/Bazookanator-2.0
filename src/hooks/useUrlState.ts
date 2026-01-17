'use client'

import { useMemo, useCallback } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

export function useUrlState<T>(
  key: string,
  defaultValue: T,
  serialize: (value: T) => string = String,
  deserialize: (value: string) => T = (v) => v as T,
) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const defaultSerialized = useMemo(() => {
    return serialize(defaultValue)
  }, [defaultValue, serialize])

  const value = useMemo(() => {
    const param = searchParams.get(key)
    return param == null ? defaultValue : deserialize(param)
  }, [searchParams, deserialize, key, defaultValue])

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const nextValue =
        typeof next === 'function' ? (next as (p: T) => T)(value) : next
      const params = new URLSearchParams(searchParams.toString())
      const serialized = serialize(nextValue)

      if (serialized && serialized !== defaultSerialized) {
        params.set(key, serialized)
      } else {
        params.delete(key)
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [value, searchParams, key, serialize, defaultSerialized, router, pathname],
  )

  return [value, setValue] as const
}
