'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePostInteractions } from '@/lib/hooks/use-post-interactions'
import { cn } from '@/lib/utils'
import { sizes } from '@/lib/constants'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const { liked, likesCount, isPending, toggleLike } = usePostInteractions({
    postId,
    initialLiked,
    initialBookmarked: false,
    initialLikesCount: initialCount,
  })

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLike}
      disabled={isPending}
      className={cn(
        'transition-colors',
        liked && 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
      )}
    >
      <Heart
        className={cn(
          sizes.iconWithText + ' transition-colors',
          liked && 'fill-red-500 text-red-500'
        )}
      />
      {likesCount}
    </Button>
  )
}
