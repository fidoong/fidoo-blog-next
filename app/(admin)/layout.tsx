import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // 所有登录用户都可以访问文章管理
  return (
    <main className="container mx-auto py-8 px-4">
      {children}
    </main>
  )
}
