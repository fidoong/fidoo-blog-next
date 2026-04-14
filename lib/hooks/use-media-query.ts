'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    const updateMatch = () => setMatches(media.matches)
    updateMatch()

    media.addEventListener('change', updateMatch)
    return () => media.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}

// 预设断点
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export function useBreakpoint(breakpoint: keyof typeof breakpoints) {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`)
}

// 常用响应式 hooks
export function useIsMobile() {
  return !useMediaQuery(`(min-width: ${breakpoints.md})`)
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`
  )
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`)
}
