import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function findUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  })
}

export async function findUserByUsername(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username),
  })
}

export async function createUser(data: {
  email: string
  username: string
  name?: string | null
  password: string
  image?: string | null
  role?: 'USER' | 'AUTHOR' | 'MODERATOR' | 'ADMIN'
}) {
  const [user] = await db.insert(users).values(data).returning()
  return user
}
