import Link from 'next/link'
import { ArrowRight, PenLine, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { siteConfig } from '@/config/site'
import { getPosts } from '@/lib/actions/posts'
import { Calendar, Eye } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate } from '@/lib/utils'

export default async function HomePage() {
  const { posts } = await getPosts({ page: 1, limit: 6 })

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            欢迎来到 {siteConfig.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            一个现代化的技术博客平台，分享前沿技术、开发经验和创新思考。
            这里汇集了优质的技术文章和活跃的开发者社区。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button size="lg">
                浏览文章
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                了解更多
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PenLine className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">优质内容</h3>
              <p className="text-muted-foreground">
                精心撰写的技术文章，涵盖前端、后端、移动端等多个领域
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">活跃社区</h3>
              <p className="text-muted-foreground">
                与志同道合的开发者交流，分享经验，共同成长
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">持续成长</h3>
              <p className="text-muted-foreground">
                紧跟技术潮流，不断学习新知识，提升个人能力
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">最新文章</h2>
            <Link href="/blog">
              <Button variant="ghost">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {posts.length === 0 ? (
            <EmptyState
              title="暂无文章"
              description="还没有发布任何文章，稍后再来看看吧"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {post.coverImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {post.category.name ?? '-'}
                        </Badge>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 link-primary">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={post.author.avatar || ''} />
                            <AvatarFallback className="text-xs">
                              {post.author.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{post.author.name || post.author.username}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
