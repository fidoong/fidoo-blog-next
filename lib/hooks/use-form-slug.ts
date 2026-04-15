'use client'

import { useCallback } from 'react'
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { slugify } from '@/lib/utils'

interface UseFormSlugOptions<T extends FieldValues> {
  form: UseFormReturn<T>
  sourceField: Path<T>
  targetField: Path<T>
}

export function useFormSlug<T extends FieldValues>(options: UseFormSlugOptions<T>) {
  const { form, sourceField, targetField } = options

  const generateSlug = useCallback(() => {
    const sourceValue = form.getValues(sourceField) as string
    if (!sourceValue) return

    const generated = slugify(sourceValue)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue(targetField, generated as any)
  }, [form, sourceField, targetField])

  return {
    generateSlug,
  }
}
