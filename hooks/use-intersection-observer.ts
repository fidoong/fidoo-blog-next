'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0, rootMargin = '200px', triggerOnce = false } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setRef = useCallback((el: HTMLElement | null) => {
    setElement(el)
  }, [])

  useEffect(() => {
    if (!element) return
    if (triggerOnce && hasTriggered) return

    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting
        setIsIntersecting(intersecting)

        if (intersecting && triggerOnce) {
          setHasTriggered(true)
          observerRef.current?.unobserve(element)
        }
      },
      { threshold, rootMargin }
    )

    observerRef.current.observe(element)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [element, threshold, rootMargin, triggerOnce, hasTriggered])

  const reset = useCallback(() => {
    setHasTriggered(false)
    setIsIntersecting(false)
  }, [])

  return { ref: setRef, isIntersecting, hasTriggered, reset }
}
