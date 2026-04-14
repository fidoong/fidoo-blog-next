'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface EditorPreviewProps {
  content: string
}

export function EditorPreview({ content }: EditorPreviewProps) {
  const processedContent = useMemo(() => {
    // 处理 frontmatter
    return content.replace(/^---[\s\S]*?---/, '').trim()
  }, [content])

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-medium mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="leading-7 mb-4">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-muted rounded-lg overflow-x-auto">
                <code className={className}>{children}</code>
              </pre>
            )
          },
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-muted" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-muted">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-muted px-4 py-2 bg-muted font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-muted px-4 py-2">{children}</td>
          ),
        }}
      >
        {processedContent || '开始写作...'}
      </ReactMarkdown>
    </div>
  )
}
