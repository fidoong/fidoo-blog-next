'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PostWithRelations } from '@/types/models'

interface PostsResponse {
  posts: PostWithRelations[]
  total: number
  totalPages: number
  page: number
  hasMore: boolean
}

interface UseInfinitePostsOptions {
  category?: string
  search?: string
  limit?: number
  prefetchPages?: number
}

export function useInfinitePosts(options: UseInfinitePostsOptions = {}) {
  const { category, search, limit = 10, prefetchPages = 1 } = options

  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingNext, setIsFetchingNext] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsFetchingNext(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: limit.toString(),
        })
        if (category) params.set('category', category)
        if (search) params.set('search', search)

        const response = await fetch(`/api/posts?${params}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`)
        }

        const data: PostsResponse = await response.json()

        setPosts((prev) =>
          isInitial ? data.posts : [...prev, ...data.posts]
        )
        setHasMore(data.hasMore)
        setTotal(data.total)

        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return null
      } finally {
        if (isInitial) {
          setIsLoading(false)
        } else {
          setIsFetchingNext(false)
        }
      }
    },
    [category, search, limit]
  )

  // 初始加载 - 依赖变化时重置并加载
  useEffect(() => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    setError(null)
    fetchPosts(1, true)
  }, [category, search, fetchPosts])

  // 加载下一页
  const loadMore = useCallback(async () => {
    if (isFetchingNext || !hasMore) return

    const nextPage = page + 1
    const result = await fetchPosts(nextPage)

    if (result) {
      setPage(nextPage)

      // 预加载后续页面
      if (prefetchPages > 0 && result.hasMore) {
        prefetchNextPages(nextPage + 1)
      }
    }
  }, [page, isFetchingNext, hasMore, fetchPosts, prefetchPages])

  // 预加载后续页面
  const prefetchNextPages = useCallback(
    async (startPage: number) => {
      const pagesToPrefetch = Math.min(prefetchPages, 2)

      for (let i = 0; i < pagesToPrefetch; i++) {
        const pageNum = startPage + i

        try {
          const params = new URLSearchParams({
            page: pageNum.toString(),
            limit: limit.toString(),
          })
          if (category) params.set('category', category)
          if (search) params.set('search', search)

          await fetch(`/api/posts?${params}`, {
            priority: 'low',
          } as RequestInit)
        } catch {
          // 预加载失败静默处理
        }
      }
    },
    [category, search, limit, prefetchPages]
  )

  // 刷新数据
  const refresh = useCallback(() => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    setError(null)
    fetchPosts(1, true)
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    isFetchingNext,
    hasMore,
    total,
    error,
    loadMore,
    refresh,
  }
}
