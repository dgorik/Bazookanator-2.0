'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
}

type ApiResponse = Product[] | Error

const fakeApiCall = (
  query: string,
  signal: AbortSignal,
): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    const random = Math.random()
    if (random > 0.5) {
      const timeoutId = setTimeout(
        () => {
          const db = [
            'Apple',
            'Banana',
            'Orange',
            'Pineapple',
            'Grapes',
            'Watermelon',
          ]
          const filtered = db
            .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
            .map((name, index) => ({ id: index, name }))

          resolve(filtered)
        },
        Math.random() * 500 + 200,
      ) // Random delay between 200-700ms

      // Support aborting the fetch
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    } else {
      reject(new Error("Your request couldn't be filled"))
    }
  })
}

const useDebouncer = (value: string, delay: number) => {
  const [debounceQuery, setDebounceQuery] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceQuery(value)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounceQuery
}

export default function Test() {
  const [inputValue, setInputValue] = useState('')
  const debouncedQuery = useDebouncer(inputValue, 2000)
  const [error, setError] = useState<null | string>(null)
  const [data, setData] = useState<Product[]>([])

  useEffect(() => {
    if (!debouncedQuery) {
      setData([])
      setError(null)
      return
    }

    const abortController = new AbortController()
    const signal = abortController.signal

    const handleResponse = async () => {
      setError(null)
      setData([])

      try {
        const res = await fakeApiCall(debouncedQuery, signal)
        if (!(res instanceof Error)) {
          setData(res)
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message)
        }
      }
    }
    handleResponse()

    return () => abortController.abort() //this one runs when a user navigates away, dependencies change, component is destroyed
  }, [debouncedQuery])

  return (
    <>
      <div className="flex flex-col justify-center items-center h-dvh">
        <p> Testing</p>
        <div>
          <input
            placeholder="enter the text here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        {data.length > 0 && (
          <ul>
            {data.map((item, index) => (
              <li key={index}> {item.name} </li>
            ))}
          </ul>
        )}

        {data.length === 0 && !error && debouncedQuery && (
          <p>No results were found for &quot{debouncedQuery}&quot</p>
        )}

        {error && <p> This is your {error} </p>}
      </div>
    </>
  )
}
