import { TimestampFields, PaginationParams, FilterParams, SortParams } from './index'

// ============================================
// 基础关系类型
// ============================================

/**
 * 文章作者信息（公开字段）
 */
export interface PostAuthor {
  id: string
  username: string
  name: string | null
  avatar: string | null
  bio: string | null
}

/**
 * 文章分类信息
 */
export interface PostCategory {
  id: string
  name: string
  slug: string
  description: string | null
}

// ============================================
// 用户模型
// ============================================

export type UserRole = 'USER' | 'AUTHOR' | 'MODERATOR' | 'ADMIN'

export interface User extends TimestampFields {
  id: string
  email: string
  username: string
  name: string | null
  avatar: string | null
  bio: string | null
  github: string | null
  twitter: string | null
  website: string | null
  role: UserRole
  emailVerified: Date | null
}

// 安全版本（公开信息）
export interface PublicUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
  bio: string | null
}

// ============================================
// 文章模型
// ============================================

/**
 * 基础文章类型（数据库原始结构）
 */
export interface Post extends TimestampFields {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  published: boolean
  featured: boolean
  views: number
  likesCount: number
  commentsCount: number
  readingTime: number
  publishedAt: Date | null
  authorId: string
  categoryId: string
}

/**
 * 带完整关系的文章（用于详情页、编辑页）
 */
export interface PostWithRelations extends Omit<Post, 'authorId' | 'categoryId'> {
  author: PostAuthor
  category: PostCategory
  tags: Tag[]
}

/**
 * 文章摘要（用于列表页）
 */
export interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  featured: boolean
  views: number
  likesCount: number
  commentsCount: number
  readingTime: number
  createdAt: Date
  publishedAt: Date | null
  author: PostAuthor
  category: PostCategory
  tags: Tag[]
}

/**
 * 管理后台文章列表项
 */
export interface AdminPostListItem {
  id: string
  title: string
  slug: string
  published: boolean
  views: number
  likesCount: number
  commentsCount: number
  createdAt: Date
  category: PostCategory
}

// ============================================
// 分类与标签
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number | null
  createdAt?: Date
  updatedAt?: Date
  postCount?: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  postCount?: number
}

// ============================================
// 评论模型
// ============================================

export interface Comment extends TimestampFields {
  id: string
  content: string
  authorId: string
  postId: string
  parentId: string | null
  likesCount: number
}

/**
 * 带作者信息的评论（用于展示）
 */
export interface CommentWithAuthor extends Omit<Comment, 'authorId'> {
  author: PostAuthor
  replies: CommentWithAuthor[]
}

// ============================================
// 互动模型
// ============================================

export interface Like {
  userId: string
  postId: string
  createdAt: Date
}

export interface Bookmark {
  userId: string
  postId: string
  createdAt: Date
  post: PostSummary
}

export interface Follow {
  followerId: string
  followingId: string
  createdAt: Date
}

// ============================================
// 分页结果类型
// ============================================

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

// ============================================
// API 查询参数
// ============================================

export interface GetPostsQuery extends PaginationParams, FilterParams {
  sort?: SortParams
  includeDrafts?: boolean
  featured?: boolean
}

export interface GetCommentsQuery extends PaginationParams {
  postId: string
  parentId?: string | null
}
