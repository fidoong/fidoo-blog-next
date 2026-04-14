import { NextAuthOptions } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: string
      username: string
    }
  }

  interface User {
    role?: string
    username?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    username?: string
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          role: 'USER',
        }
      },
    })] : []),
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET ? [Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email.split('@')[0],
          role: 'USER',
        }
      },
    })] : []),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        })

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          username: user.username,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role
      }
      if (token.username && session.user) {
        session.user.username = token.username
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        // OAuth 登录：需要根据 email 查找或创建用户，获取 UUID
        if (account.provider === 'github' || account.provider === 'google') {
          try {
            const dbUser = await db.query.users.findFirst({
              where: eq(users.email, user.email!),
            })
            
            if (dbUser) {
              // 已存在用户，使用数据库 UUID
              token.sub = dbUser.id
              token.role = dbUser.role
              token.username = dbUser.username
            } else {
              // 新用户，创建记录
              const username = user.username || user.email!.split('@')[0]
              // 确保用户名唯一
              const existingUsername = await db.query.users.findFirst({
                where: eq(users.username, username),
              })
              const finalUsername = existingUsername 
                ? `${username}_${Date.now().toString(36)}` 
                : username
                
              const [newUser] = await db.insert(users).values({
                email: user.email!,
                username: finalUsername,
                name: user.name,
                avatar: user.image,
                role: 'USER',
              }).returning()
              
              token.sub = newUser.id
              token.role = newUser.role
              token.username = newUser.username
            }
          } catch (error) {
            console.error('OAuth JWT callback error:', error)
            throw error
          }
        } else {
          // Credentials 登录：直接使用 user.id（已是 UUID）
          token.sub = user.id
          token.role = user.role
          token.username = user.username
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
}
