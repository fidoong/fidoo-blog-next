'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { likes, posts } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server-permissions'
import { eq, and, count } from 'drizzle-orm'

// 检查用户是否点赞了文章
export async function hasLikedPost(postId: string) {
  const user = await requireAuth()

  const like = await db.query.likes.findFirst({
    where: and(eq(likes.userId, user.id), eq(likes.postId, postId)),
  })

  return !!like
}

// 获取文章点赞数
export async function getPostLikesCount(postId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, postId))

  return result.count
}

// 点赞/取消点赞文章
export async function togglePostLike(postId: string) {
  const user = await requireAuth()

  const existingLike = await db.query.likes.findFirst({
    where: and(eq(likes.userId, user.id), eq(likes.postId, postId)),
  })

  if (existingLike) {
    // 取消点赞
    await db
      .delete(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.postId, postId)))

    // 更新文章点赞数
    const [updated] = await db
      .update(posts)
      .set({
        likesCount: await getPostLikesCount(postId),
      })
      .where(eq(posts.id, postId))
      .returning({ likesCount: posts.likesCount })

    revalidatePath('/blog')
    revalidatePath(`/blog/${postId}`)

    return { liked: false, likesCount: updated.likesCount }
  } else {
    // 添加点赞
    await db.insert(likes).values({
      userId: user.id,
      postId,
    })

    // 更新文章点赞数
    const [updated] = await db
      .update(posts)
      .set({
        likesCount: await getPostLikesCount(postId),
      })
      .where(eq(posts.id, postId))
      .returning({ likesCount: posts.likesCount })

    revalidatePath('/blog')
    revalidatePath(`/blog/${postId}`)

    return { liked: true, likesCount: updated.likesCount }
  }
}

// 获取用户点赞的所有文章ID列表
export async function getUserLikedPostIds() {
  const user = await requireAuth()

  const userLikes = await db.query.likes.findMany({
    where: eq(likes.userId, user.id),
    columns: { postId: true },
  })

  return userLikes.map((like) => like.postId)
}
