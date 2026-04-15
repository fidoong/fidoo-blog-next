import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { deletePost } from '@/lib/actions/posts'
import { transformAdminPostListItem } from '@/types/transformers'
import type { AdminPostListItem } from '@/types/models'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate } from '@/lib/utils'

async function getUserPosts(userId: string): Promise<AdminPostListItem[]> {
  const rawPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, userId),
    orderBy: desc(posts.createdAt),
    with: {
      category: true,
    },
  })

  return rawPosts.map(transformAdminPostListItem)
}

export async function PostsContent() {
  const session = await auth()
  const postsList = await getUserPosts(session!.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">文章管理</h1>
        <Link href="/write">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>阅读量</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <EmptyState
                    title="还没有文章"
                    description="开始创作你的第一篇文章吧"
                    action={
                      <Link href="/write">
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          开始创作
                        </Button>
                      </Link>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              postsList.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline"
                      target="_blank"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>{post.category.name ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? '已发布' : '草稿'}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.views}</TableCell>
                  <TableCell>
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/posts/edit/${post.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form
                        action={async () => {
                          'use server'
                          await deletePost(post.id)
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          type="submit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
