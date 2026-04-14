'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { posts, postsToTags } from '@/lib/db/schema'
import { requireAuth, requireResourceAccess } from '@/lib/auth/server-permissions'
import { postFormSchema } from '@/types/forms'
import { eq, and, desc, ilike, count } from 'drizzle-orm'
import { tags } from '@/lib/db/schema'
import { z } from 'zod'

// 获取文章列表
export async function getPosts({
  page = 1,
  limit = 10,
  search,
  category,
  published = true,
  authorId,
  includeDrafts = false,
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  published?: boolean
  authorId?: string
  includeDrafts?: boolean
}) {
  const offset = (page - 1) * limit

  const query = db.query.posts.findMany({
    where: (posts, { and, eq, ilike }) => {
      const conditions = []

      if (!includeDrafts) {
        conditions.push(eq(posts.published, published))
      }

      if (search) {
        conditions.push(ilike(posts.title, `%${search}%`))
      }

      if (category) {
        conditions.push(eq(posts.categoryId, category))
      }

      if (authorId) {
        conditions.push(eq(posts.authorId, authorId))
      }

      return conditions.length > 0 ? and(...conditions) : undefined
    },
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
      tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: desc(posts.createdAt),
    limit,
    offset,
  })

  const postsList = await query

  // 转换标签格式
  const formattedPosts = postsList.map((post) => ({
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  }))

  // 获取总数
  const [totalResult] = await db
    .select({ count: count() })
    .from(posts)
    .where(
      and(
        includeDrafts ? undefined : eq(posts.published, published),
        search ? ilike(posts.title, `%${search}%`) : undefined,
        category ? eq(posts.categoryId, category) : undefined,
        authorId ? eq(posts.authorId, authorId) : undefined
      )
    )

  return {
    posts: formattedPosts,
    total: totalResult.count,
    totalPages: Math.ceil(totalResult.count / limit),
    page,
  }
}

// 获取标签下的文章
export async function getPostsByTagSlug(tagSlug: string, limit = 20) {
  // 先获取标签
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, tagSlug),
  })

  if (!tag) {
    return { posts: [], total: 0 }
  }

  // 获取关联的文章ID
  const postTags = await db.query.postsToTags.findMany({
    where: eq(postsToTags.tagId, tag.id),
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
    orderBy: desc(postsToTags.postId),
    limit,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postsList: any[] = postTags.map((pt) => ({
    ...pt.post,
    tags: [], // 简化处理，不在列表页显示标签
  }))

  // 获取总数
  const [countResult] = await db
    .select({ count: count() })
    .from(postsToTags)
    .where(eq(postsToTags.tagId, tag.id))

  return {
    posts: postsList,
    total: countResult.count,
    tag,
  }
}

// 获取单篇文章（通过 slug）
export async function getPostBySlug(slug: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          github: true,
          twitter: true,
        },
      },
      category: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!post) return null

  return {
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  }
}

// 增加文章浏览量
export async function incrementPostViews(slug: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    columns: { id: true, views: true },
  })

  if (!post) return null

  const [updated] = await db
    .update(posts)
    .set({ views: post.views + 1 })
    .where(eq(posts.id, post.id))
    .returning({ views: posts.views })

  return updated
}

// 获取单篇文章（通过 ID）
export async function getPost(id: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          github: true,
          twitter: true,
        },
      },
      category: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!post) return null

  return {
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  }
}

// 创建文章
export async function createPost(data: z.infer<typeof postFormSchema>) {
  const user = await requireAuth()
  const validated = postFormSchema.parse(data)

  const existing = await db.query.posts.findFirst({
    where: eq(posts.slug, validated.slug),
  })

  if (existing) {
    throw new Error('Slug already exists')
  }

  const readingTime = Math.ceil(validated.content.length / 200)

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

// 更新文章
export async function updatePost(
  postId: string,
  data: z.infer<typeof postFormSchema>
) {
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

  const readingTime = Math.ceil(validated.content.length / 200)

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

// 删除文章
export async function deletePost(postId: string) {
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
