import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { PostForm } from '@/components/blog/post-form'

async function getPost(id: string, userId: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!post || post.authorId !== userId) {
    return null
  }

  return {
    ...post,
    tags: post.tags.map((t) => t.tag),
  }
}

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const session = await auth()
  const [post, categories, allTags] = await Promise.all([
    getPost(id, session!.user.id),
    getCategories(),
    getTags(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">编辑文章</h1>
        <p className="text-muted-foreground">修改文章内容</p>
      </div>

      <PostForm post={post} categories={categories} allTags={allTags} />
    </div>
  )
}
