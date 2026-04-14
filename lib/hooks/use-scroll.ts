'use client'

import { useState, useEffect, useCallback, RefObject } from 'react'

interface ScrollPosition {
  x: number
  y: number
}

interface ScrollDirection {
  isScrollingUp: boolean
  isScrollingDown: boolean
  isAtTop: boolean
  isAtBottom: boolean
}

export function useScroll(threshold: number = 0) {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 })
  const [direction, setDirection] = useState<ScrollDirection>({
    isScrollingUp: false,
    isScrollingDown: false,
    isAtTop: true,
    isAtBottom: false,
  })

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight

    setPosition({ x: window.scrollX, y: currentY })

    setDirection((prev) => ({
      isScrollingUp: currentY < prev.y,
      isScrollingDown: currentY > prev.y,
      isAtTop: currentY <= threshold,
      isAtBottom: currentY >= maxScroll - threshold,
    }))
  }, [threshold])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { position, direction }
}

// 检测元素是否在视口内
export function useInView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) {
  const [ref, setRef] = useState<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, options)

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, options])

  return { ref: setRef, isInView }
}

// 追踪特定元素的滚动进度
export function useScrollProgress(ref: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleScroll = () => {
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const elementHeight = rect.height

      // 计算元素在视口中的进度
      const scrolled = windowHeight - rect.top
      const total = windowHeight + elementHeight
      const newProgress = Math.max(0, Math.min(1, scrolled / total))

      setProgress(newProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初始计算

    return () => window.removeEventListener('scroll', handleScroll)
  }, [ref])

  return progress
}
