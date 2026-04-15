/**
 * 将文本转换为 URL 友好的 slug
 * @param text 原始文本
 * @param maxLength 最大长度（默认 50）
 * @returns slug 字符串
 */
export function slugify(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
}

/**
 * 生成唯一的 slug（添加时间戳）
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = slugify(text, 40)
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

/**
 * 验证 slug 格式
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}
