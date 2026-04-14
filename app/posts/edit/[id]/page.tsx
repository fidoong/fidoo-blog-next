import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPost } from '@/lib/actions/posts'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { PostForm } from '@/components/blog/post-form'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login?callbackUrl=/posts/edit/' + id)
  }

  const [post, categories, tags] = await Promise.all([
    getPost(id),
    getCategories(),
    getTags(),
  ])

  if (!post) {
    notFound()
  }

  // 只能编辑自己的文章（管理员可以编辑所有）
  const authorId = (post.author as { id?: string })?.id
  if (authorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">编辑文章</h1>
        <p className="text-muted-foreground">修改你的文章内容</p>
      </div>

      <PostForm 
        post={{
          ...post,
          tags: post.tags || [],
        }} 
        categories={categories} 
        allTags={tags} 
      />
    </div>
  )
}
