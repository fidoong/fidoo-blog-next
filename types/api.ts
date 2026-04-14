import { PaginationParams, FilterParams, SortParams } from './index'

// ============================================
// API 响应封装
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface ApiMeta {
  timestamp: string
  requestId: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// 文章相关 API 类型
// ============================================

export interface GetPostsQuery extends PaginationParams, FilterParams {
  sort?: SortParams
  includeDrafts?: boolean
  featured?: boolean
}

export interface CreatePostBody {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  published?: boolean
  categoryId: string
  tagIds: string[]
}

export interface UpdatePostBody extends Partial<CreatePostBody> {
  id: string
}

// ============================================
// 评论相关 API 类型
// ============================================

export interface CreateCommentBody {
  content: string
  postId: string
  parentId?: string
}

export interface UpdateCommentBody {
  id: string
  content: string
}

// ============================================
// 用户相关 API 类型
// ============================================

export interface UpdateUserBody {
  name?: string
  bio?: string
  avatar?: string
  github?: string
  twitter?: string
  website?: string
}

// ============================================
// 统计数据
// ============================================

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  totalViews: number
  totalComments: number
  totalLikes: number
  followers: number
  following: number
  postsTrend: number
  viewsTrend: number
  recentPosts: PostSummary[]
  dailyViews: { date: string; views: number }[]
}
