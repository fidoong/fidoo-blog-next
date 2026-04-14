'use client'

import { useState, useCallback, useRef } from 'react'

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T
}

interface AsyncState<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError, initialData } = options
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  })

  const isMounted = useRef(true)

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await asyncFunction()

      if (isMounted.current) {
        setState({ data, isLoading: false, error: null })
        onSuccess?.(data)
      }

      return data
    } catch (error) {
      if (isMounted.current) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({ data: initialData, isLoading: false, error: err })
        onError?.(err)
      }
      throw error
    }
  }, [asyncFunction, onSuccess, onError, initialData])

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null })
  }, [initialData])

  return { ...state, execute, reset }
}

// 带参数的异步 Hook
export function useAsyncFn<T, P extends unknown[]>(
  asyncFunction: (...params: P) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError, initialData } = options
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  })

  const isMounted = useRef(true)

  const execute = useCallback(
    async (...params: P) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const data = await asyncFunction(...params)

        if (isMounted.current) {
          setState({ data, isLoading: false, error: null })
          onSuccess?.(data)
        }

        return data
      } catch (error) {
        if (isMounted.current) {
          const err = error instanceof Error ? error : new Error(String(error))
          setState({ data: initialData, isLoading: false, error: err })
          onError?.(err)
        }
        throw error
      }
    },
    [asyncFunction, onSuccess, onError, initialData]
  )

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null })
  }, [initialData])

  return { ...state, execute, reset }
}
