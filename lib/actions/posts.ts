'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { posts, postsToTags } from '@/lib/db/schema'
import { requireAuth, requireResourceAccess } from '@/lib/auth/server-permissions'
import { postFormSchema } from '@/types/forms'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Post } from '@/types/models'
import { calculateReadingTime } from '@/lib/utils'
import {
  findPosts,
  findPostsByTagSlug,
  findPostBySlug,
  findPostById,
  incrementPostViews,
} from '@/lib/repositories/post-repository'

export {
  findPosts as getPosts,
  findPostsByTagSlug as getPostsByTagSlug,
  findPostBySlug as getPostBySlug,
  findPostById as getPost,
  incrementPostViews,
}

export async function createPost(data: z.infer<typeof postFormSchema>): Promise<Post> {
  const user = await requireAuth()
  const validated = postFormSchema.parse(data)

  const existing = await db.query.posts.findFirst({
    where: eq(posts.slug, validated.slug),
  })

  if (existing) {
    throw new Error('Slug already exists')
  }

  const readingTime = calculateReadingTime(validated.content)

  const [post] = await db
    .insert(posts)
    .values({
      ...validated,
      authorId: user.id,
      readingTime,
      publishedAt: validated.published ? new Date() : null,
    })
    .returning()

  if (validated.tagIds.length > 0) {
    await db.insert(postsToTags).values(
      validated.tagIds.map((tagId) => ({
        postId: post.id,
        tagId,
      }))
    )
  }

  revalidatePath('/blog')
  revalidatePath('/')

  return post
}

export async function updatePost(
  postId: string,
  data: z.infer<typeof postFormSchema>
): Promise<Post> {
  await requireAuth()

  const existingPost = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  })

  if (!existingPost) {
    throw new Error('Post not found')
  }

  await requireResourceAccess(existingPost.authorId)

  const validated = postFormSchema.parse(data)

  if (validated.slug !== existingPost.slug) {
    const conflicting = await db.query.posts.findFirst({
      where: eq(posts.slug, validated.slug),
    })
    if (conflicting && conflicting.id !== postId) {
      throw new Error('Slug already exists')
    }
  }

  const readingTime = calculateReadingTime(validated.content)

  const [post] = await db
    .update(posts)
    .set({
      ...validated,
      readingTime,
      updatedAt: new Date(),
      publishedAt:
        validated.published && !existingPost.published
          ? new Date()
          : existingPost.publishedAt,
    })
    .where(eq(posts.id, postId))
    .returning()

  await db.delete(postsToTags).where(eq(postsToTags.postId, postId))

  if (validated.tagIds.length > 0) {
    await db.insert(postsToTags).values(
      validated.tagIds.map((tagId) => ({
        postId: post.id,
        tagId,
      }))
    )
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${validated.slug}`)
  revalidatePath('/')

  return post
}

export async function deletePost(postId: string): Promise<{ success: boolean }> {
  await requireAuth()

  const existingPost = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  })

  if (!existingPost) {
    throw new Error('Post not found')
  }

  await requireResourceAccess(existingPost.authorId)
  await db.delete(posts).where(eq(posts.id, postId))

  revalidatePath('/blog')
  revalidatePath('/')

  return { success: true }
}
