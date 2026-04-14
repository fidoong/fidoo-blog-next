import { Post, PostSummary, Comment, PublicUser, Category, Tag } from './models'

// ============================================
// 通用组件 Props
// ============================================

export interface WithChildren {
  children: React.ReactNode
}

export interface WithClassName {
  className?: string
}

// ============================================
// 博客组件 Props
// ============================================

export interface PostCardProps extends WithClassName {
  post: PostSummary
  showExcerpt?: boolean
  showAuthor?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

export interface PostListProps extends WithClassName {
  posts: PostSummary[]
  emptyMessage?: string
  variant?: 'grid' | 'list'
}

export interface PostContentProps extends WithClassName {
  post: Post
}

export interface CommentItemProps extends WithClassName {
  comment: Comment
  postId: string
  onReply?: (parentId: string) => void
  depth?: number
}

export interface CommentListProps extends WithClassName {
  comments: Comment[]
  postId: string
}

export interface TagBadgeProps extends WithClassName {
  tag: Tag
  variant?: 'default' | 'secondary' | 'outline' | 'link'
}

export interface CategoryBadgeProps extends WithClassName {
  category: Category
  variant?: 'default' | 'secondary' | 'outline' | 'link'
}

export interface UserAvatarProps extends WithClassName {
  user: PublicUser
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export interface UserInfoProps extends WithClassName {
  user: PublicUser
  showAvatar?: boolean
  showBio?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// ============================================
// 编辑器组件 Props
// ============================================

export interface MarkdownEditorProps extends WithClassName {
  initialValue?: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
}

export interface EditorPreviewProps extends WithClassName {
  content: string
}

// ============================================
// 布局组件 Props
// ============================================

export interface HeaderProps extends WithClassName {
  transparent?: boolean
}

export interface SidebarProps extends WithClassName {
  categories?: Category[]
  tags?: Tag[]
  popularPosts?: PostSummary[]
}

// ============================================
// 交互组件 Props
// ============================================

export interface LikeButtonProps extends WithClassName {
  postId: string
  initialLiked?: boolean
  initialCount?: number
}

export interface BookmarkButtonProps extends WithClassName {
  postId: string
  initialBookmarked?: boolean
}

export interface FollowButtonProps extends WithClassName {
  userId: string
  initialFollowing?: boolean
}

export interface ShareButtonsProps extends WithClassName {
  title: string
  url: string
}

// ============================================
// 搜索组件 Props
// ============================================

export interface SearchDialogProps extends WithClassName {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  slug: string
  category: Category
}

// ============================================
// 分页组件 Props
// ============================================

export interface PaginationProps extends WithClassName {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface LoadMoreProps extends WithClassName {
  hasMore: boolean
  onLoadMore: () => void
  loading?: boolean
}
