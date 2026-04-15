/**
 * 计算文章阅读时间
 * @param content Markdown 内容
 * @param wordsPerMinute 每分钟阅读字数（默认 200）
 * @returns 阅读时间（分钟）
 */
import { READING } from '@/lib/constants'

export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = READING.WORDS_PER_MINUTE
): number {
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#*_~`]/g, '')

  const wordCount = plainText.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

/**
 * 格式化阅读时间
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '少于 1 分钟'
  if (minutes === 1) return '1 分钟'
  return `${minutes} 分钟`
}
