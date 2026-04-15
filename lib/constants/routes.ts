export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  TAGS: '/tags',
  TAG_DETAIL: (slug: string) => `/tags/${slug}`,
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/api/auth/signout',
  WRITE: '/write',
  EDIT_POST: (id: string) => `/posts/edit/${id}`,
  DASHBOARD: '/dashboard',
  ADMIN_POSTS: '/posts',
  UNAUTHORIZED: '/unauthorized',
} as const

export const API_ROUTES = {
  POSTS: '/api/posts',
  POST_DETAIL: (id: string) => `/api/posts/${id}`,
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/signin',
  AUTH_LOGOUT: '/api/auth/signout',
  NEXTAUTH: '/api/auth/[...nextauth]',
} as const

export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com',
  TWITTER: 'https://twitter.com',
} as const

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  if (!params) return path
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value))
  })
  return `${path}?${searchParams.toString()}`
}
