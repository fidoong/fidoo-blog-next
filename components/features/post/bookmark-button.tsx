'use client'

import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePostInteractions } from '@/lib/hooks/use-post-interactions'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ postId, initialBookmarked }: BookmarkButtonProps) {
  const { bookmarked, isPending, toggleBookmark } = usePostInteractions({
    postId,
    initialLiked: false,
    initialBookmarked,
    initialLikesCount: 0,
  })

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleBookmark}
      disabled={isPending}
      className={cn(
        'transition-colors',
        bookmarked && 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
      )}
    >
      <Bookmark
        className={cn(
          'mr-2 h-4 w-4 transition-colors',
          bookmarked && 'fill-yellow-500 text-yellow-500'
        )}
      />
      {bookmarked ? '已收藏' : '收藏'}
    </Button>
  )
}
