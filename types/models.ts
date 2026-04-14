import { TimestampFields, PaginationParams, FilterParams, SortParams } from './index'

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
  author: PublicUser
  categoryId: string
  category: Category
  tags: Tag[]
}

// 列表展示用（精简字段）
export type PostWithRelations = Post

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
  author: PublicUser
  category: Category
  tags: Tag[]
}

// ============================================
// 分类与标签
// ============================================

export interface Category extends Partial<TimestampFields> {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number | null
  postCount?: number
}

export interface Tag extends TimestampFields {
  id: string
  name: string
  slug: string
  description: string | null
  postCount?: number
}

// ============================================
// 评论模型
// ============================================

export interface Comment extends TimestampFields {
  id: string
  content: string
  authorId: string
  author: PublicUser
  postId: string
  parentId: string | null
  likesCount: number
  replies: Comment[]
  _count?: {
    replies: number
  }
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
