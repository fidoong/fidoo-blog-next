import type {
  PostWithRelations,
  PostSummary,
  AdminPostListItem,
  CommentWithAuthor,
  PostAuthor,
  PostCategory,
} from './models'

/**
 * 转换 Drizzle 查询的作者字段为 PostAuthor
 */
export function transformAuthor(raw: any): PostAuthor {
  return {
    id: raw.id,
    username: raw.username,
    name: raw.name ?? null,
    avatar: raw.avatar ?? null,
    bio: raw.bio ?? null,
  }
}

/**
 * 转换 Drizzle 查询的分类字段为 PostCategory
 */
export function transformCategory(raw: any): PostCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
  }
}

/**
 * 转换 Drizzle 查询结果为 PostWithRelations
 */
export function transformPostWithRelations(raw: any): PostWithRelations {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? null,
    content: raw.content,
    coverImage: raw.coverImage ?? null,
    published: raw.published,
    featured: raw.featured,
    views: raw.views,
    likesCount: raw.likesCount,
    commentsCount: raw.commentsCount,
    readingTime: raw.readingTime,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    publishedAt: raw.publishedAt ?? null,
    author: transformAuthor(raw.author),
    category: transformCategory(raw.category),
    tags: raw.tags?.map((pt: any) => pt.tag) ?? [],
  }
}

/**
 * 转换为 PostSummary
 */
export function transformPostSummary(raw: any): PostSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? null,
    coverImage: raw.coverImage ?? null,
    published: raw.published,
    featured: raw.featured,
    views: raw.views,
    likesCount: raw.likesCount,
    commentsCount: raw.commentsCount,
    readingTime: raw.readingTime,
    createdAt: raw.createdAt,
    publishedAt: raw.publishedAt ?? null,
    author: transformAuthor(raw.author),
    category: transformCategory(raw.category),
    tags: raw.tags?.map((pt: any) => pt.tag) ?? [],
  }
}

/**
 * 转换评论为 CommentWithAuthor
 */
export function transformComment(raw: any): CommentWithAuthor {
  return {
    id: raw.id,
    content: raw.content,
    author: transformAuthor(raw.author),
    postId: raw.postId,
    parentId: raw.parentId ?? null,
    likesCount: raw.likesCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    replies: raw.replies?.map(transformComment) ?? [],
  }
}

/**
 * 转换为 AdminPostListItem
 */
export function transformAdminPostListItem(raw: any): AdminPostListItem {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    published: raw.published,
    views: raw.views,
    likesCount: raw.likesCount,
    commentsCount: raw.commentsCount,
    createdAt: raw.createdAt,
    category: transformCategory(raw.category),
  }
}
