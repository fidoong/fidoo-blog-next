'use client'

import { useState, useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleBookmark } from '@/lib/actions/bookmarks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ postId, initialBookmarked }: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)

  const handleToggleBookmark = () => {
    startTransition(async () => {
      try {
        const result = await toggleBookmark(postId)
        setBookmarked(result.bookmarked)
        toast.success(result.bookmarked ? '已收藏' : '已取消收藏')
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          toast.error('请先登录后再收藏')
        } else {
          toast.error('操作失败，请重试')
        }
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleBookmark}
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
