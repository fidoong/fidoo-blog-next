'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { usePosts } from '@/hooks/use-infinite-posts'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { PostCard } from '@/components/features/post/post-card'
import {
  PostCardSkeleton,
  LoadMoreSkeleton,
} from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import type { Category } from '@/types/models'

interface BlogContentProps {
  category?: string
  categories: Category[]
}

export function BlogContent({ category, categories }: BlogContentProps) {
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    total,
    error,
    fetchNextPage,
    refetch,
  } = usePosts({
    category,
    limit: 10,
  })

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '400px',
    triggerOnce: false,
  })

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const currentCategory = category
    ? categories.find((c) => c.id === category)
    : null

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="page-title">文章列表</h1>
          </div>
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
        <Sidebar
          categories={categories}
          currentCategory={category}
          total={total}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="page-title">文章列表</h1>
            {currentCategory && (
              <Badge variant="secondary">{currentCategory.name}</Badge>
            )}
          </div>
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              共 {total} 篇文章
            </span>
          )}
        </div>

        {isLoading ? (
          <PostCardSkeleton count={5} />
        ) : posts.length === 0 ? (
          <EmptyState
            title="暂无文章"
            description="当前分类下还没有文章，敬请期待"
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {isFetchingNextPage && <LoadMoreSkeleton />}

            {hasNextPage && !isFetchingNextPage && (
              <div
                ref={loadMoreRef}
                className="h-12 flex items-center justify-center"
              >
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                已加载全部 {total} 篇文章
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar
        categories={categories}
        currentCategory={category}
        total={total}
      />
    </div>
  )
}

interface SidebarProps {
  categories: Category[]
  currentCategory?: string
  total: number
}

function Sidebar({ categories, currentCategory, total }: SidebarProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-4">
          <h3 className="font-semibold mb-4">分类</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/blog">
              <Button
                variant={!currentCategory ? 'secondary' : 'ghost'}
                size="sm"
              >
                全部
              </Button>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/blog?category=${cat.id}`}>
                <Button
                  variant={currentCategory === cat.id ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-4">
            <h3 className="font-semibold mb-2">统计</h3>
            <p className="text-sm text-muted-foreground">
              共 {total} 篇文章
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
