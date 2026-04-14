'use client'

import { useState, useCallback, useTransition } from 'react'
import { togglePostLike as togglePostLikeAction } from '@/lib/actions/likes'
import { toggleBookmark as toggleBookmarkAction } from '@/lib/actions/bookmarks'
import { toast } from 'sonner'

interface UsePostInteractionsOptions {
  postId: string
  initialLiked: boolean
  initialBookmarked: boolean
  initialLikesCount: number
}

interface PostInteractionsState {
  liked: boolean
  bookmarked: boolean
  likesCount: number
  isPending: boolean
}

interface PostInteractionsActions {
  toggleLike: () => void
  toggleBookmark: () => void
}

/**
 * 文章交互逻辑 Hook
 * 统一处理点赞、收藏等交互
 */
export function usePostInteractions(
  options: UsePostInteractionsOptions
): PostInteractionsState & PostInteractionsActions {
  const { postId, initialLiked, initialBookmarked, initialLikesCount } = options

  const [state, setState] = useState({
    liked: initialLiked,
    bookmarked: initialBookmarked,
    likesCount: initialLikesCount,
  })

  const [isPending, startTransition] = useTransition()

  const toggleLike = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await togglePostLikeAction(postId)
        setState((prev) => ({
          ...prev,
          liked: result.liked,
          likesCount: result.likesCount,
        }))
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          toast.error('请先登录后再点赞')
        } else {
          toast.error('操作失败，请重试')
        }
      }
    })
  }, [postId])

  const toggleBookmark = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(postId)
        setState((prev) => ({
          ...prev,
          bookmarked: result.bookmarked,
        }))
        toast.success(result.bookmarked ? '已收藏' : '已取消收藏')
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          toast.error('请先登录后再收藏')
        } else {
          toast.error('操作失败，请重试')
        }
      }
    })
  }, [postId])

  return {
    ...state,
    isPending,
    toggleLike,
    toggleBookmark,
  }
}
