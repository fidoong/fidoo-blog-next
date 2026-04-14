'use client'

import { useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'

function slugify(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
}

interface UseFormSlugOptions {
  form: UseFormReturn<any>
  sourceField: string
  targetField: string
}

/**
 * 表单 Slug 自动生成 Hook
 */
export function useFormSlug(options: UseFormSlugOptions) {
  const { form, sourceField, targetField } = options

  const generateSlug = useCallback(() => {
    const sourceValue = form.getValues(sourceField)
    if (!sourceValue) return

    const slug = slugify(sourceValue)
    form.setValue(targetField, slug)
  }, [form, sourceField, targetField])

  return {
    generateSlug,
  }
}
