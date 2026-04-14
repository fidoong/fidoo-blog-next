'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAutosaveOptions<T> {
  enabled: boolean
  data: T
  key: string
  interval?: number
  onSave?: (data: T) => void
}

interface UseAutosaveReturn {
  lastSaved: Date | null
  isSaving: boolean
  forceSave: () => void
  clearSaved: () => void
}

/**
 * 自动保存 Hook
 * 定期将数据保存到 localStorage
 */
export function useAutosave<T>(
  options: UseAutosaveOptions<T>
): UseAutosaveReturn {
  const { enabled, data, key, interval = 30000, onSave } = options

  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const save = useCallback(() => {
    if (!enabled) return
    setIsSaving(true)
    try {
      localStorage.setItem(key, JSON.stringify(dataRef.current))
      setLastSaved(new Date())
      onSave?.(dataRef.current)
    } catch (error) {
      console.error('Autosave failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [enabled, key, onSave])

  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(save, interval)
    return () => clearInterval(timer)
  }, [enabled, interval, save])

  const forceSave = useCallback(() => {
    save()
  }, [save])

  const clearSaved = useCallback(() => {
    localStorage.removeItem(key)
    setLastSaved(null)
  }, [key])

  return {
    lastSaved,
    isSaving,
    forceSave,
    clearSaved,
  }
}

/**
 * 恢复已保存的数据
 */
export function restoreAutosaved<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : null
  } catch {
    return null
  }
}
