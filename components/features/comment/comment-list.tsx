'use client'

import { useState } from 'react'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import type { BlogComment } from '@/types/comments'

interface CommentListProps {
  postId: string
  comments: BlogComment[]
  currentUserId?: string
  commentsCount: number
  likedCommentIds?: string[]
}

export function CommentList({ postId, comments, currentUserId, commentsCount, likedCommentIds = [] }: CommentListProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          评论 ({commentsCount})
        </h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            写评论
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <CommentForm
            postId={postId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>暂无评论，来发表第一条评论吧！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              likedCommentIds={likedCommentIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}
