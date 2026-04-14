'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { bookmarks } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server-permissions'
import { eq, and, desc } from 'drizzle-orm'

// 检查用户是否收藏了文章
export async function hasBookmarkedPost(postId: string) {
  const user = await requireAuth()

  const bookmark = await db.query.bookmarks.findFirst({
    where: and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId)),
  })

  return !!bookmark
}

// 收藏/取消收藏文章
export async function toggleBookmark(postId: string) {
  const user = await requireAuth()

  const existingBookmark = await db.query.bookmarks.findFirst({
    where: and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId)),
  })

  if (existingBookmark) {
    // 取消收藏
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId)))

    revalidatePath('/blog')
    revalidatePath(`/blog/${postId}`)

    return { bookmarked: false }
  } else {
    // 添加收藏
    await db.insert(bookmarks).values({
      userId: user.id,
      postId,
    })

    revalidatePath('/blog')
    revalidatePath(`/blog/${postId}`)

    return { bookmarked: true }
  }
}

// 获取用户的收藏文章列表
export async function getUserBookmarks() {
  const user = await requireAuth()

  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, user.id),
    with: {
      post: {
        with: {
          author: {
            columns: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
        },
      },
    },
    orderBy: desc(bookmarks.createdAt),
  })

  return userBookmarks.map((bookmark) => bookmark.post)
}

// 获取用户收藏的文章ID列表（用于批量检查）
export async function getUserBookmarkedPostIds() {
  const user = await requireAuth()

  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, user.id),
    columns: { postId: true },
  })

  return userBookmarks.map((bookmark) => bookmark.postId)
}
