# 09 - TanStack Query 集成

## 🎯 目标

正确配置和使用 TanStack Query，优化数据获取，实现缓存、去重、重试等高级功能。

## 📊 当前问题

### 问题分析

**发现**：
1. ✅ TanStack Query v5.99.0 已安装
2. ❌ 完全未使用（浪费 ~500KB bundle）
3. ❌ 手动实现了 149 行状态管理（use-infinite-posts.ts）
4. ❌ 无缓存、去重、重试机制
5. ❌ 未配置 QueryClientProvider

**当前实现**：
```typescript
// hooks/use-infinite-posts.ts (149 行)
export function useInfinitePosts(options) {
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingNext, setIsFetchingNext] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 手动管理状态、错误处理、预加载...
  // 149 行代码
}
```

**问题**：
- 手动状态管理复杂
- 无缓存（重复请求相同数据）
- 无请求去重（快速切换分类会发多个请求）
- 无自动重试
- 无后台刷新

---

## 🔧 解决方案

### 架构设计

```
┌─────────────────────────────────────┐
│   React Components                  │
│   - 使用 useQuery/useMutation       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   TanStack Query Layer              │
│   - 缓存管理                         │
│   - 请求去重                         │
│   - 自动重试                         │
│   - 后台刷新                         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   API Layer                         │
│   - fetch('/api/posts')             │
│   - Server Actions                  │
└─────────────────────────────────────┘
```

### 使用场景划分

| 场景 | 使用方案 | 原因 |
|------|---------|------|
| 无限滚动 | TanStack Query | 需要缓存、去重 |
| 文章列表 | TanStack Query | 需要缓存 |
| 创建/更新/删除 | useMutation + Server Actions | 类型安全 |
| 文章详情（SSR） | Server Actions | SEO 友好 |

---

## 📝 实施步骤

### 步骤 1：配置 QueryClientProvider

```typescript
// components/providers.tsx - 重构

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Toaster } from 'sonner'
import { toast } from 'sonner'

const ThemeProvider = dynamic(
  () => import('next-themes').then((mod) => mod.ThemeProvider),
  { ssr: false }
)

/**
 * 创建 QueryClient 配置
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据新鲜时间：1 分钟内不重新请求
        staleTime: 60 * 1000,
        
        // 垃圾回收时间：5 分钟后清理缓存
        gcTime: 5 * 60 * 1000,
        
        // 窗口聚焦时不自动刷新
        refetchOnWindowFocus: false,
        
        // 网络重连时不自动刷新
        refetchOnReconnect: false,
        
        // 失败重试 1 次
        retry: 1,
        
        // 重试延迟（指数退避）
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // 全局错误处理
        onError: (error) => {
          console.error('Mutation error:', error)
          
          // 根据错误类型显示不同提示
          if (error instanceof Error) {
            if (error.message.includes('Unauthorized')) {
              toast.error('请先登录')
            } else if (error.message.includes('Forbidden')) {
              toast.error('权限不足')
            } else {
              toast.error(error.message)
            }
          } else {
            toast.error('操作失败，请重试')
          }
        },
      },
    },
  })
}

// 浏览器端单例
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务端：每次创建新实例
    return makeQueryClient()
  } else {
    // 浏览器端：使用单例
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // 使用 useState 确保客户端只创建一次
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-center" />
      </ThemeProvider>
      
      {/* 开发环境显示 DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
```

---

### 步骤 2：安装 DevTools（开发依赖）

```bash
pnpm add -D @tanstack/react-query-devtools
```

---

### 步骤 3：重构无限滚动 Hook

```typescript
// hooks/use-infinite-posts.ts - 重构（149 行 → 30 行）

'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostWithRelations } from '@/types/models'

interface PostsResponse {
  posts: PostWithRelations[]
  total: number
  totalPages: number
  page: number
  hasMore: boolean
}

interface UseInfinitePostsOptions {
  category?: string
  search?: string
  limit?: number
}

/**
 * 无限滚动文章列表 Hook
 * 使用 TanStack Query 实现
 */
export function useInfinitePosts(options: UseInfinitePostsOptions = {}) {
  const { category, search, limit = 10 } = options

  return useInfiniteQuery({
    // 查询键（用于缓存）
    queryKey: ['posts', 'infinite', { category, search, limit }],
    
    // 查询函数
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: limit.toString(),
      })
      
      if (category) params.set('category', category)
      if (search) params.set('search', search)

      const response = await fetch(`/api/posts?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      return response.json() as Promise<PostsResponse>
    },
    
    // 获取下一页参数
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    
    // 初始页码
    initialPageParam: 1,
    
    // 数据新鲜时间：1 分钟
    staleTime: 60 * 1000,
    
    // 启用占位数据（显示上次缓存的数据）
    placeholderData: (previousData) => previousData,
  })
}

/**
 * 便捷 Hook：返回扁平化的数据
 */
export function usePosts(options: UseInfinitePostsOptions = {}) {
  const query = useInfinitePosts(options)

  return {
    // 扁平化所有页的文章
    posts: query.data?.pages.flatMap((page) => page.posts) ?? [],
    
    // 总数（从第一页获取）
    total: query.data?.pages[0]?.total ?? 0,
    
    // 加载状态
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    
    // 错误信息
    error: query.error?.message ?? null,
    
    // 操作方法
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  }
}
```

#### 使用示例

```typescript
// app/blog/blog-content.tsx - 使用重构后的 Hook

'use client'

import { usePosts } from '@/hooks/use-infinite-posts'
import { PostList } from '@/components/features/post/components/post-list'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { useEffect } from 'react'

export function BlogContent({ category, categories }) {
  const {
    posts,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch,
  } = usePosts({ category, limit: 10 })

  // 自动加载更多
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '400px',
  })

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div>
      <PostList
        posts={posts}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
      
      {/* 加载更多触发器 */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="h-12 flex items-center justify-center">
          {isFetchingNextPage && <LoadingState size="sm" />}
        </div>
      )}
      
      {/* 已加载全部 */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-muted py-4">
          已加载全部 {total} 篇文章
        </p>
      )}
    </div>
  )
}
```

---

### 步骤 4：创建 Mutation Hooks

```typescript
// lib/hooks/use-post-mutations.ts - 新建

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPost, updatePost, deletePost } from '@/lib/actions/posts'
import type { PostFormData } from '@/types/forms'

/**
 * 创建文章 Mutation
 */
export function useCreatePost() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: createPost,
    
    onSuccess: (post) => {
      // 失效相关查询缓存
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      
      toast.success('文章创建成功')
      router.push(`/blog/${post.slug}`)
    },
    
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '创建失败')
    },
  })
}

/**
 * 更新文章 Mutation
 */
export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: PostFormData) => updatePost(postId, data),
    
    onSuccess: (post) => {
      // 失效相关查询缓存
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      
      toast.success('文章更新成功')
      router.push(`/blog/${post.slug}`)
    },
    
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '更新失败')
    },
  })
}

/**
 * 删除文章 Mutation
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePost,
    
    // 乐观更新
    onMutate: async (postId) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      
      // 保存当前数据（用于回滚）
      const previousPosts = queryClient.getQueryData(['posts'])
      
      // 乐观更新：从缓存中移除文章
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.filter((p: any) => p.id !== postId),
            })),
          }
        }
      )
      
      return { previousPosts }
    },
    
    onSuccess: () => {
      toast.success('文章删除成功')
    },
    
    onError: (error, postId, context) => {
      // 回滚乐观更新
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts)
      }
      
      toast.error(error instanceof Error ? error.message : '删除失败')
    },
    
    onSettled: () => {
      // 无论成功失败，都重新获取数据
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
```

#### 使用示例

```typescript
// components/blog/post-form.tsx - 使用 Mutation

'use client'

import { useCreatePost, useUpdatePost } from '@/lib/hooks/use-post-mutations'
import { usePostForm } from '@/lib/hooks/use-post-form'

export function PostForm({ post, categories, allTags }) {
  const createMutation = useCreatePost()
  const updateMutation = useUpdatePost(post?.id)
  
  const { form, handleSubmit } = usePostForm({
    post,
    onSuccess: (data) => {
      if (post) {
        updateMutation.mutate(data)
      } else {
        createMutation.mutate(data)
      }
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {post ? '更新文章' : '创建文章'}
      </Button>
    </form>
  )
}
```

---

### 步骤 5：创建查询 Hooks

```typescript
// lib/hooks/use-post-queries.ts - 新建

'use client'

import { useQuery } from '@tanstack/react-query'
import { getPostBySlug, getCategories, getTags } from '@/lib/actions/posts'

/**
 * 查询文章详情
 */
export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

/**
 * 查询分类列表
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000, // 10 分钟（分类很少变化）
  })
}

/**
 * 查询标签列表
 */
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: 10 * 60 * 1000, // 10 分钟
  })
}
```

---

### 步骤 6：预加载策略

```typescript
// lib/utils/prefetch.ts - 新建

import { QueryClient } from '@tanstack/react-query'
import { getPostBySlug } from '@/lib/actions/posts'

/**
 * 预加载文章详情
 */
export async function prefetchPost(queryClient: QueryClient, slug: string) {
  await queryClient.prefetchQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug),
  })
}

/**
 * 在链接 hover 时预加载
 */
export function usePrefetchOnHover() {
  const queryClient = useQueryClient()

  return (slug: string) => {
    prefetchPost(queryClient, slug)
  }
}
```

#### 使用示例

```typescript
// components/blog/post-card.tsx - 添加预加载

import { usePrefetchOnHover } from '@/lib/utils/prefetch'

export function PostCard({ post }) {
  const prefetch = usePrefetchOnHover()

  return (
    <Link 
      href={`/blog/${post.slug}`}
      onMouseEnter={() => prefetch(post.slug)}
    >
      {/* 卡片内容 */}
    </Link>
  )
}
```

---

## 📊 配置选项说明

### Query 配置

| 选项 | 默认值 | 说明 | 建议 |
|------|--------|------|------|
| `staleTime` | 60s | 数据新鲜时间 | 文章列表 60s，详情 5min |
| `gcTime` | 5min | 缓存保留时间 | 默认即可 |
| `refetchOnWindowFocus` | false | 窗口聚焦刷新 | 关闭（避免频繁请求） |
| `retry` | 1 | 失败重试次数 | 1 次即可 |

### Mutation 配置

| 选项 | 说明 | 使用场景 |
|------|------|---------|
| `onMutate` | 乐观更新 | 删除、点赞等即时反馈 |
| `onSuccess` | 成功回调 | 失效缓存、跳转页面 |
| `onError` | 错误回调 | 显示错误提示、回滚 |
| `onSettled` | 完成回调 | 重新获取数据 |

---

## 🎯 预期效果

### 代码量变化

| 指标 | 改造前 | 改造后 | 提升 |
|------|--------|--------|------|
| use-infinite-posts.ts | 149 行 | 30 行 | 80% ↓ |
| 状态管理代码 | 手动管理 | 自动管理 | - |
| 错误处理 | 分散 | 统一 | - |

### 功能提升

| 功能 | 改造前 | 改造后 |
|------|--------|--------|
| 缓存 | ❌ 无 | ✅ 自动缓存 |
| 请求去重 | ❌ 无 | ✅ 自动去重 |
| 自动重试 | ❌ 无 | ✅ 失败重试 1 次 |
| 乐观更新 | ❌ 无 | ✅ 支持 |
| 后台刷新 | ❌ 无 | ✅ 支持 |
| DevTools | ❌ 无 | ✅ 开发环境可用 |

### 用户体验提升

1. **更快的响应**：缓存命中时无需等待
2. **更少的请求**：去重避免重复请求
3. **更好的容错**：自动重试失败请求
4. **即时反馈**：乐观更新提供即时反馈

---

## ⚠️ 注意事项

### 1. 缓存失效策略

```typescript
// ✅ 好的做法：精确失效
queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] })

// ❌ 不好的做法：全局失效
queryClient.invalidateQueries()
```

### 2. 查询键设计

```typescript
// ✅ 好的做法：结构化查询键
['posts', 'infinite', { category, search, limit }]

// ❌ 不好的做法：字符串拼接
[`posts-${category}-${search}`]
```

### 3. 服务端渲染

```typescript
// ✅ 好的做法：SSR 页面仍使用 Server Actions
// app/blog/[slug]/page.tsx
export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug) // Server Action
  return <PostDetail post={post} />
}

// ❌ 不好的做法：SSR 页面使用 useQuery
// 会导致客户端二次请求
```

---

## 📝 测试清单

- [ ] 无限滚动正常工作
- [ ] 分类切换时缓存生效
- [ ] 快速切换分类不会发送重复请求
- [ ] 创建文章后列表自动刷新
- [ ] 删除文章有乐观更新
- [ ] 网络错误时自动重试
- [ ] DevTools 在开发环境显示
- [ ] 生产环境 DevTools 不打包

---

## 🚀 实施时间

- **配置 Provider**：15 分钟
- **重构无限滚动**：30 分钟
- **创建 Mutation Hooks**：30 分钟
- **创建 Query Hooks**：15 分钟
- **测试验证**：30 分钟
- **总计**：2 小时

---

## 📚 参考资源

- [TanStack Query 官方文档](https://tanstack.com/query/latest)
- [Next.js + TanStack Query 最佳实践](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [查询键设计指南](https://tkdodo.eu/blog/effective-react-query-keys)
