import { db, pool } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'

const coverImages = [
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
]

async function updatePosts() {
  console.log('🖼️  Updating posts with missing cover images...')

  try {
    // Get all posts without cover images
    const postsWithoutImages = await db.query.posts.findMany({
      where: isNull(posts.coverImage),
    })

    console.log(`Found ${postsWithoutImages.length} posts without cover images`)

    let updated = 0
    for (let i = 0; i < postsWithoutImages.length; i++) {
      const post = postsWithoutImages[i]
      const imageUrl = coverImages[i % coverImages.length]
      
      await db.update(posts)
        .set({ coverImage: imageUrl })
        .where(eq(posts.id, post.id))
      
      updated++
      console.log(`✅ Updated: ${post.title}`)
    }

    console.log(`\n🎉 Updated ${updated} posts with cover images!`)
  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

updatePosts()
