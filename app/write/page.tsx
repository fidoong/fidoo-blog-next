import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCategories } from '@/lib/actions/categories'
import { getTags } from '@/lib/actions/tags'
import { WriteForm } from './write-form'

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
    <div className="min-h-screen bg-background">
      <WriteForm categories={categories} allTags={tags} user={session.user} />
    </div>
  )
}
