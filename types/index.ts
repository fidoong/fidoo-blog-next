// ============================================
// 基础实体类型
// ============================================

export interface TimestampFields {
  createdAt: Date
  updatedAt: Date
}

export interface SoftDeletable {
  deletedAt: Date | null
}

// 分页相关
export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string | null
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

// 排序和筛选
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  category?: string
  tag?: string
  published?: boolean
  authorId?: string
  dateFrom?: Date
  dateTo?: Date
}
