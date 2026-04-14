'use client'

import { useState, useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CommentForm } from './comment-form'
import { deleteComment, toggleCommentLike } from '@/lib/actions/comments'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { BlogComment } from '@/types/comments'

interface CommentItemProps {
  comment: BlogComment
  currentUserId?: string
  depth?: number
}

export function CommentItem({ comment, currentUserId, depth = 0 }: CommentItemProps) {
  const [isPending, startTransition] = useTransition()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likesCount)
  const [isDeleted, setIsDeleted] = useState(false)

  const isAuthor = currentUserId === comment.authorId
  const canDelete = isAuthor || false // 管理员检查可以在这里添加

  const handleLike = () => {
    startTransition(async () => {
      try {
        const result = await toggleCommentLike(comment.id)
        setIsLiked(result.liked)
        setLikesCount(result.likesCount)
        toast.success(result.liked ? '点赞成功' : '取消点赞')
      } catch (error) {
        console.error('Comment like error:', error)
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized')) {
            toast.error('请先登录后再点赞')
          } else {
            toast.error(`点赞失败: ${error.message}`)
          }
        } else {
          toast.error('点赞失败，请重试')
        }
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('确定要删除这条评论吗？')) return

    startTransition(async () => {
      try {
        await deleteComment(comment.id, comment.postId)
        setIsDeleted(true)
        toast.success('评论已删除')
      } catch {
        toast.error('删除失败')
      }
    })
  }

  if (isDeleted) {
    return (
      <div className="py-4 text-sm text-muted-foreground italic">
        该评论已被删除
      </div>
    )
  }

  return (
    <div className={cn('py-4', depth > 0 && 'pl-8 border-l-2 border-muted ml-4')}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author.avatar || ''} />
          <AvatarFallback>{comment.author.name?.[0] || comment.author.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {comment.author.name || comment.author.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
          <p className="text-sm leading-relaxed break-words">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleLike}
              disabled={isPending}
            >
              <Heart
                className={cn(
                  'mr-1 h-3 w-3',
                  isLiked && 'fill-red-500 text-red-500'
                )}
              />
              {likesCount}
            </Button>
            
            {depth < 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                回复
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                删除
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`回复 ${comment.author.name || comment.author.username}...`}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
