'use client'

import { useSyncExternalStore } from 'react'

// 使用闭包存储值，避免 React 19 的 ref 限制
function createPreviousStore<T>() {
  let current: T | undefined = undefined
  let previous: T | undefined = undefined
  const listeners: Set<() => void> = new Set()

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return previous
    },
    setValue(value: T) {
      if (value !== current) {
        previous = current
        current = value
        listeners.forEach(l => l())
      }
    },
  }
}

// 为每个 hook 实例创建一个 store
const storeMap = new WeakMap<object, ReturnType<typeof createPreviousStore<unknown>>>()

export function usePrevious<T>(value: T): T | undefined {
  // 使用一个稳定的 key 来获取 store
  const store = (() => {
    const key = usePrevious as object
    if (!storeMap.has(key)) {
      storeMap.set(key, createPreviousStore<T>())
    }
    return storeMap.get(key)!
  })()

  // 设置当前值（在 subscribe 前调用以确保 store 已更新）
  store.setValue(value)

  // 订阅 store 变化
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => undefined // SSR 返回 undefined
  ) as T | undefined
}

// 比较值是否变化
export function useHasChanged<T>(
  value: T,
  comparator?: (a: T, b: T) => boolean
): boolean {
  const previous = usePrevious(value)
  const isEqual = comparator
    ? previous !== undefined && comparator(previous, value)
    : previous === value
  return !isEqual && previous !== undefined
}
