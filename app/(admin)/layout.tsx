import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // 所有登录用户都可以访问创作功能
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
