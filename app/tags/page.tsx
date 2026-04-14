import Link from 'next/link'
import { getTags, getPopularTags } from '@/lib/actions/tags'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag, BookOpen, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = {
  title: '标签 | Fidoo Blog',
  description: '浏览所有文章标签，发现你感兴趣的内容',
}

export default async function TagsPage() {
  const [allTags, popularTags] = await Promise.all([
    getTags(),
    getPopularTags(20),
  ])

  // 为所有标签获取文章数量（使用 popularTags 的数据或默认0）
  const popularTagsMap = new Map(popularTags.map(t => [t.id, t.postCount]))
  const tagsWithCount = allTags.map(tag => ({
    ...tag,
    postCount: popularTagsMap.get(tag.id) || 0
  }))

  // 按文章数排序
  const sortedTags = tagsWithCount.sort((a, b) => b.postCount - a.postCount)

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">标签</h1>
          <p className="text-lg text-muted-foreground">
            发现感兴趣的话题，探索更多优质内容
          </p>
        </div>

        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="popular">
              <TrendingUp className="h-4 w-4 mr-2" />
              热门标签
            </TabsTrigger>
            <TabsTrigger value="all">
              <Tag className="h-4 w-4 mr-2" />
              全部标签
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularTags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        #{tag.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {tag.postCount} 篇
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-8">
            <div className="flex flex-wrap gap-3">
              {sortedTags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="text-sm px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    #{tag.name}
                    <span className="ml-1.5 text-muted-foreground group-hover:text-primary-foreground">
                      ({tag.postCount})
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {allTags.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">暂无标签</h3>
            <p className="text-muted-foreground">
              标签将在文章发布时自动创建
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
