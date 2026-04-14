import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  name: z.string().min(2, '昵称至少2个字符').max(100, '昵称最多100个字符'),
  password: z.string().min(6, '密码至少6个字符'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, username, name, password } = parsed.data

    // Check if email exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // Check if username exists
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, username),
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: '该用户名已被使用' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email,
        username,
        name,
        passwordHash,
        role: 'USER',
      })
      .returning({ id: users.id })

    return NextResponse.json(
      { message: '注册成功', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
