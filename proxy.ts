import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth/config'

export default async function proxy(request: Request) {
  const session = await getServerSession(authConfig)
  const { pathname } = new URL(request.url)

  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/tags') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')

  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')

  if (isPublicRoute) return NextResponse.next()

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdminRoute && (!userRole || !['AUTHOR', 'MODERATOR', 'ADMIN'].includes(userRole))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
