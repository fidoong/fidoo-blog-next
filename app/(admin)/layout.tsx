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

  if (!['AUTHOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
