import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { PostForm } from '@/components/blog/post-form'

export default async function WritePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/write')
  }

  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">创作文章</h1>
        <p className="text-muted-foreground">分享你的想法和经验</p>
      </div>

      <PostForm categories={categories} allTags={tags} />
    </div>
  )
}
