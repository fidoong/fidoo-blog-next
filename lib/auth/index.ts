// Next-Auth v4 in App Router
// 使用 @auth/prisma-adapter 和 getServerSession 的兼容方式

import { getServerSession } from 'next-auth'
import { authConfig } from './config'
import { cookies, headers } from 'next/headers'

// 在 App Router 中获取 session 的辅助函数
export async function auth() {
  // 在构建时返回模拟数据，避免报错
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'build@example.com',
        name: 'Build User',
        image: null,
        role: 'ADMIN',
        username: 'builduser',
      }
    }
  }

  try {
    const headersList = await headers()
    const cookiesList = await cookies()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req: any = {
      headers: Object.fromEntries(headersList),
      cookies: Object.fromEntries(
        cookiesList.getAll().map(c => [c.name, c.value])
      ),
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = { getHeader: () => {}, setHeader: () => {} }
    
    const session = await getServerSession(req, res, authConfig)
    return session
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// 获取当前用户（Server Component 用）
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

// 检查是否已认证
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
