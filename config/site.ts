export const siteConfig = {
  name: 'Fidoo Blog',
  description: 'A modern technical blog built with Next.js 16',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og.png',
  links: {
    github: 'https://github.com/fidoo',
    twitter: 'https://twitter.com/fidoo',
  },
  author: {
    name: 'Fidoo',
    email: 'fidoo@example.com',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 50,
  },
}

export type SiteConfig = typeof siteConfig
