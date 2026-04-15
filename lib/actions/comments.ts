'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { comments, posts, commentLikes } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server-permissions'
import { commentFormSchema } from '@/types/forms'
import { eq, and, count } from 'drizzle-orm'
import { z } from 'zod'
import { findCommentsByPostId } from '@/lib/repositories/comment-repository'

interface CommentRecord {
  id: string
  content: string
  authorId: string
  postId: string
  parentId: string | null
  likesCount: number
  createdAt: Date
}

export { findCommentsByPostId as getCommentsByPostId }

export async function createComment(
  postId: string,
  data: z.infer<typeof commentFormSchema>
): Promise<{
  id: string
  content: string
  authorId: string
  postId: string
  parentId: string | null
  likesCount: number
  createdAt: Date
  author: { id: string; username: string; name: string | null; avatar: string | null }
  replies: []
}> {
  const user = await requireAuth()
  const validated = commentFormSchema.parse(data)

  const result = await db
    .insert(comments)
    .values({
      content: validated.content,
      authorId: user.id,
      postId,
      parentId: validated.parentId || null,
    })
    .returning()

  const comment = (result as CommentRecord[])[0]

  const [countResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, postId))

  await db
    .update(posts)
    .set({ commentsCount: countResult.count })
    .where(eq(posts.id, postId))

  revalidatePath(`/blog/${postId}`)

  return {
    ...comment,
    author: {
      id: user.id,
      username: user.username || '',
      name: user.name || null,
      avatar: user.image || null,
    },
    replies: [],
  }
}

export async function deleteComment(commentId: string, postId: string): Promise<{ success: boolean }> {
  const user = await requireAuth()

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  })

  if (!comment) {
    throw new Error('Comment not found')
  }

  if (comment.authorId !== user.id && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Unauthorized')
  }

  await db.delete(comments).where(eq(comments.id, commentId))

  const [countResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, postId))

  await db
    .update(posts)
    .set({ commentsCount: countResult.count })
    .where(eq(posts.id, postId))

  revalidatePath(`/blog/${postId}`)

  return { success: true }
}

export async function hasLikedComment(commentId: string): Promise<boolean> {
  const user = await requireAuth()

  const like = await db.query.commentLikes.findFirst({
    where: and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, commentId)),
  })

  return !!like
}

export async function getUserLikedCommentIds(commentIds: string[]): Promise<string[]> {
  const user = await requireAuth()

  if (commentIds.length === 0) return []

  const likes = await db.query.commentLikes.findMany({
    where: eq(commentLikes.userId, user.id),
    columns: { commentId: true },
  })

  return likes.map((like) => like.commentId).filter((id) => commentIds.includes(id))
}

export async function toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
  const user = await requireAuth()

  const existingLike = await db.query.commentLikes.findFirst({
    where: and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, commentId)),
  })

  if (existingLike) {
    await db
      .delete(commentLikes)
      .where(and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, commentId)))

    const [countResult] = await db
      .select({ count: count() })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId))

    await db
      .update(comments)
      .set({ likesCount: countResult.count })
      .where(eq(comments.id, commentId))

    return { liked: false, likesCount: countResult.count }
  } else {
    await db.insert(commentLikes).values({
      userId: user.id,
      commentId,
    })

    const [countResult] = await db
      .select({ count: count() })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId))

    await db
      .update(comments)
      .set({ likesCount: countResult.count })
      .where(eq(comments.id, commentId))

    return { liked: true, likesCount: countResult.count }
  }
}
