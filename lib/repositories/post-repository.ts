import { db } from '@/lib/db'
import { posts, postsToTags, tags } from '@/lib/db/schema'
import { eq, and, desc, ilike, count } from 'drizzle-orm'
import {
  transformPostWithRelations,
  transformPostSummary,
} from '@/types/transformers'
import type { PostWithRelations, PostSummary, Tag } from '@/types/models'

export interface FindPostsOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
  published?: boolean
  authorId?: string
  includeDrafts?: boolean
}

export async function findPosts(
  options: FindPostsOptions = {}
): Promise<{ posts: PostSummary[]; total: number; totalPages: number; page: number }> {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    published = true,
    authorId,
    includeDrafts = false,
  } = options
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
    posts: postsList.map(transformPostSummary),
    total: totalResult.count,
    totalPages: Math.ceil(totalResult.count / limit),
    page,
  }
}

export async function findPostsByTagSlug(
  tagSlug: string,
  limit = 20
): Promise<{ posts: PostSummary[]; total: number; tag: Tag }> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, tagSlug),
  })

  if (!tag) {
    return { posts: [], total: 0, tag: null as unknown as Tag }
  }

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
          tags: {
            with: {
              tag: true,
            },
          },
        },
      },
    },
    orderBy: desc(postsToTags.postId),
    limit,
  })

  const postsList = postTags.map((pt) => {
    const postWithTags = pt.post as typeof pt.post & { tags?: { tag: Tag }[] }
    return {
      ...pt.post,
      tags: (postWithTags.tags || []).map((t) => t.tag),
    }
  })

  const [countResult] = await db
    .select({ count: count() })
    .from(postsToTags)
    .where(eq(postsToTags.tagId, tag.id))

  return {
    posts: postsList.map(transformPostSummary),
    total: countResult.count,
    tag,
  }
}

export async function findPostBySlug(slug: string): Promise<PostWithRelations | null> {
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

  return transformPostWithRelations(post)
}

export async function findPostById(id: string): Promise<PostWithRelations | null> {
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

  return transformPostWithRelations(post)
}

export async function incrementPostViews(slug: string): Promise<{ views: number } | null> {
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
