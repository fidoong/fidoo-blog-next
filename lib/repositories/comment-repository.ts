import { db } from '@/lib/db'
import { comments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { BlogComment } from '@/types/comments'

export async function findCommentsByPostId(postId: string): Promise<BlogComment[]> {
  const commentsList = await db.query.comments.findMany({
    where: eq(comments.postId, postId),
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: desc(comments.createdAt),
  })

  const commentMap = new Map<string, BlogComment>()
  const rootComments: BlogComment[] = []

  commentsList.forEach((comment) => {
    const blogComment: BlogComment = {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      postId: comment.postId,
      parentId: comment.parentId,
      likesCount: comment.likesCount,
      createdAt: comment.createdAt,
      author: comment.author as BlogComment['author'],
      replies: [],
    }
    commentMap.set(comment.id, blogComment)
  })

  commentsList.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}
