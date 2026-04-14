'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { comments, posts, commentLikes } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server-permissions'
import { commentFormSchema } from '@/types/forms'
import { eq, and, desc, count } from 'drizzle-orm'
import { z } from 'zod'

// 获取文章的评论列表
export async function getCommentsByPostId(postId: string) {
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

  // 构建评论树结构
  const commentMap = new Map()
  const rootComments: typeof commentsList = []

  // 首先将所有评论放入 map
  commentsList.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // 然后构建层级关系
  commentsList.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}

// 创建评论
export async function createComment(
  postId: string,
  data: z.infer<typeof commentFormSchema>
) {
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comment = (result as any[])[0]

  // 更新文章评论数
  const [countResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, postId))

  await db
    .update(posts)
    .set({ commentsCount: countResult.count })
    .where(eq(posts.id, postId))

  revalidatePath(`/blog/${postId}`)

  return comment
}

// 删除评论
export async function deleteComment(commentId: string, postId: string) {
  const user = await requireAuth()

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  })

  if (!comment) {
    throw new Error('Comment not found')
  }

  // 只能删除自己的评论，或者管理员可以删除所有评论
  if (comment.authorId !== user.id && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Unauthorized')
  }

  await db.delete(comments).where(eq(comments.id, commentId))

  // 更新文章评论数
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

// 检查用户是否点赞了评论
export async function hasLikedComment(commentId: string) {
  const user = await requireAuth()

  const like = await db.query.commentLikes.findFirst({
    where: and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, commentId)),
  })

  return !!like
}

// 获取用户点赞的所有评论ID（批量查询）
export async function getUserLikedCommentIds(commentIds: string[]) {
  const user = await requireAuth()
  
  if (commentIds.length === 0) return []

  const likes = await db.query.commentLikes.findMany({
    where: and(
      eq(commentLikes.userId, user.id),
      // 使用 inArray 查询多个评论ID
    ),
    columns: { commentId: true },
  })

  return likes.map((like) => like.commentId).filter((id) => commentIds.includes(id))
}

// 点赞/取消点赞评论
export async function toggleCommentLike(commentId: string) {
  const user = await requireAuth()
  
  console.log('toggleCommentLike called:', { commentId, userId: user.id })

  try {
    const existingLike = await db.query.commentLikes.findFirst({
      where: and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, commentId)),
    })

    if (existingLike) {
      // 取消点赞
      await db
        .delete(commentLikes)
        .where(and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, commentId)))

      // 更新评论点赞数
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
      // 添加点赞
      await db.insert(commentLikes).values({
        userId: user.id,
        commentId,
      })

      // 更新评论点赞数
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
  } catch (error) {
    console.error('toggleCommentLike error:', error)
    throw error
  }
}
