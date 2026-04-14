import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { PostForm } from '@/components/blog/post-form'

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新建文章</h1>
        <p className="text-muted-foreground">创建一篇新的博客文章</p>
      </div>

      <PostForm categories={categories} allTags={tags} />
    </div>
  )
}
