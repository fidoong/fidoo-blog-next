'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostSummary } from '@/types/models'

interface PostsResponse {
  posts: PostSummary[]
  total: number
  totalPages: number
  page: number
  hasMore: boolean
}

interface UseInfinitePostsOptions {
  category?: string
  search?: string
  limit?: number
}

/**
 * 无限滚动文章列表 Hook
 * 使用 TanStack Query 实现缓存、去重、重试
 */
export function useInfinitePosts(options: UseInfinitePostsOptions = {}) {
  const { category, search, limit = 10 } = options

  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', { category, search, limit }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: limit.toString(),
      })
      if (category) params.set('category', category)
      if (search) params.set('search', search)

      const response = await fetch(`/api/posts?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      return response.json() as Promise<PostsResponse>
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 60 * 1000,
  })
}

/**
 * 便捷 Hook：返回扁平化的数据和常用状态
 */
export function usePosts(options: UseInfinitePostsOptions = {}) {
  const query = useInfinitePosts(options)

  return {
    posts: query.data?.pages.flatMap((page) => page.posts) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error?.message ?? null,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  }
}
