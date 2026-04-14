'use client'

import { useEffect } from 'react'
import { incrementPostViews } from '@/lib/actions/posts'

interface ViewTrackerProps {
  slug: string
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // 延迟执行，避免快速刷新时重复计数
    const timer = setTimeout(() => {
      incrementPostViews(slug)
    }, 2000)

    return () => clearTimeout(timer)
  }, [slug])

  return null
}
