import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

export const db = drizzle(pool, { schema })

// Type exports
export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert
export type Post = typeof schema.posts.$inferSelect
export type NewPost = typeof schema.posts.$inferInsert
export type Category = typeof schema.categories.$inferSelect
export type Tag = typeof schema.tags.$inferSelect
export type Comment = typeof schema.comments.$inferSelect
export type Like = typeof schema.likes.$inferSelect
export type Bookmark = typeof schema.bookmarks.$inferSelect
export type Follow = typeof schema.follows.$inferSelect
