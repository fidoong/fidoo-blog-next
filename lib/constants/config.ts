export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
  TAGS_PER_PAGE: 50,
} as const

export const FORM_LIMITS = {
  POST_TITLE_MAX: 200,
  POST_SLUG_MAX: 200,
  POST_EXCERPT_MAX: 500,
  POST_CONTENT_MAX: 50000,
  COMMENT_MAX: 2000,
  COMMENT_MIN: 1,
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 6,
  NAME_MAX: 100,
  BIO_MAX: 500,
} as const

export const TIME = {
  AUTOSAVE_INTERVAL: 30000,
  DEBOUNCE_DELAY: 300,
  DEBOUNCE_DELAY_LONG: 500,
  CACHE_STALE_TIME: 60000,
  CACHE_GC_TIME: 300000,
  SESSION_MAX_AGE: 30 * 24 * 60 * 60,
} as const

export const FILE = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
  IMAGE_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  AVATAR_MAX_SIZE: 2 * 1024 * 1024,
} as const

export const READING = {
  WORDS_PER_MINUTE: 200,
  WORDS_PER_MINUTE_CN: 300,
} as const

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
  SLUG_REGEX: /^[a-z0-9-]+$/,
  URL_REGEX: /^https?:\/.+/,
} as const
