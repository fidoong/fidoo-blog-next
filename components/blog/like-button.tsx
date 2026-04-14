'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { togglePostLike } from '@/lib/actions/likes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  const handleToggleLike = () => {
    startTransition(async () => {
      try {
        const result = await togglePostLike(postId)
        setLiked(result.liked)
        setCount(result.likesCount)
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          toast.error('请先登录后再点赞')
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
      onClick={handleToggleLike}
      disabled={isPending}
      className={cn(
        'transition-colors',
        liked && 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
      )}
    >
      <Heart
        className={cn(
          'mr-2 h-4 w-4 transition-colors',
          liked && 'fill-red-500 text-red-500'
        )}
      />
      {count}
    </Button>
  )
}
