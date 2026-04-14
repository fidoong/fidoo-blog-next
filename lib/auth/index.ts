import NextAuth from 'next-auth'
import { authConfig } from './config'

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authConfig)

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
