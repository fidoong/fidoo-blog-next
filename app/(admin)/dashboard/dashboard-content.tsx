import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, count, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  MessageSquare,
  Heart,
  Eye,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

async function getDashboardStats(userId: string) {
  const [postStats] = await db
    .select({
      total: count(),
      published: count(posts.published),
    })
    .from(posts)
    .where(eq(posts.authorId, userId))

  const totalViews = await db
    .select({ total: posts.views })
    .from(posts)
    .where(eq(posts.authorId, userId))

  const totalViewsCount = totalViews.reduce((sum, p) => sum + p.total, 0)

  const recentPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, userId),
    orderBy: desc(posts.createdAt),
    limit: 5,
    with: {
      category: true,
    },
  })

  return {
    totalPosts: postStats.total,
    publishedPosts: postStats.published,
    totalViews: totalViewsCount,
    recentPosts,
  }
}

export async function DashboardContent() {
  const session = await auth()
  const stats = await getDashboardStats(session!.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <Link href="/posts/new">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            写文章
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总文章数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts} 篇已发布
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总阅读量</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              持续增长中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评论数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">即将上线</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">点赞数</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">即将上线</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近文章</CardTitle>
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              查看全部
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              还没有文章，开始创作吧！
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {post.category?.name} · {post.views} 阅读 ·{' '}
                      {post.published ? '已发布' : '草稿'}
                    </p>
                  </div>
                  <Link href={`/posts/${post.id}/edit`}>
                    <Button variant="ghost" size="sm">编辑</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
