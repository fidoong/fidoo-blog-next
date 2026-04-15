/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param locale 语言环境（默认 zh-CN）
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, locale: string = 'zh-CN'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | string, locale: string = 'zh-CN'): string {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 格式化相对时间（如：3 分钟前）
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} 周前`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} 个月前`
  return `${Math.floor(diffInSeconds / 31536000)} 年前`
}

/**
 * 格式化为 ISO 字符串
 */
export function toISOString(date: Date | string): string {
  return new Date(date).toISOString()
}

/**
 * 判断是否为今天
 */
export function isToday(date: Date | string): boolean {
  const today = new Date()
  const target = new Date(date)
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  )
}
