'use client'

import { useState, useCallback, useEffect, useSyncExternalStore, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { Button } from '@/components/ui/button'
import { EditorPreview } from './editor-preview'
import { useDebounce } from '@/lib/hooks'
import { Eye, Edit3, Columns2, Type, Bold, Italic, Quote, Code, Minus, List } from 'lucide-react'

interface MarkdownEditorProps {
  initialValue?: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
  minHeight?: string
}

type ViewMode = 'edit' | 'preview' | 'split'

export function MarkdownEditor({
  initialValue = '',
  onChange,
  onSave,
  placeholder = '开始写作，支持 Markdown 语法...',
  minHeight = '500px',
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [editorHeight, setEditorHeight] = useState(minHeight)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedContent = useDebounce(content, 500)
  
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // 自动计算可用高度
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const availableHeight = windowHeight - rect.top - 40 // 40px bottom padding
        setEditorHeight(`${Math.max(500, availableHeight)}px`)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    onChange(debouncedContent)
  }, [debouncedContent, onChange])

  // 快捷键绑定
  const saveShortcut = Prec.high(
    keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          onSave?.()
          return true
        },
      },
    ])
  )

  const handleChange = useCallback((value: string) => {
    setContent(value)
  }, [])

  // 插入 Markdown 语法
  const insertMarkdown = (before: string, after: string = '') => {
    const editor = document.querySelector('.cm-content') as HTMLElement
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    // 创建新的文本节点
    const newText = before + (selectedText || '') + after
    
    // 删除选中的内容
    range.deleteContents()
    
    // 插入新内容
    const textNode = document.createTextNode(newText)
    range.insertNode(textNode)
    
    // 更新编辑器内容
    const newContent = editor.textContent || ''
    setContent(newContent)
  }

  const toolbarItems = [
    { icon: Type, action: () => insertMarkdown('# ', ''), title: '标题', label: 'H1' },
    { icon: Type, action: () => insertMarkdown('## ', ''), title: '二级标题', label: 'H2' },
    { icon: Type, action: () => insertMarkdown('### ', ''), title: '三级标题', label: 'H3' },
    null, // separator
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: '加粗', label: 'B' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: '斜体', label: 'I' },
    null, // separator
    { icon: Quote, action: () => insertMarkdown('> ', ''), title: '引用' },
    { icon: Code, action: () => insertMarkdown('```\n', '\n```'), title: '代码块' },
    { icon: List, action: () => insertMarkdown('- ', ''), title: '列表' },
    { icon: Minus, action: () => insertMarkdown('---\n', ''), title: '分隔线' },
  ]

  if (!mounted) {
    return (
      <div
        className="bg-[#282c34] rounded-lg animate-pulse"
        style={{ minHeight: editorHeight }}
      />
    )
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col border rounded-xl overflow-hidden bg-background shadow-sm"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-0.5">
          {toolbarItems.map((item, index) => (
            item === null ? (
              <div key={index} className="w-px h-6 bg-border mx-1" />
            ) : (
              <Button
                key={item.title}
                variant="ghost"
                size="sm"
                onClick={item.action}
                title={item.title}
                className="h-8 px-2 text-xs font-medium"
              >
                {item.label ? (
                  <span className={item.label === 'H1' ? 'font-bold' : item.label === 'H2' ? 'font-semibold' : item.label === 'H3' ? 'font-medium' : ''}>
                    {item.label}
                  </span>
                ) : (
                  <item.icon className="h-4 w-4" />
                )}
              </Button>
            )
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          <Button
            variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
            className="h-7 px-2 text-xs"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1" />
            编辑
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className="h-7 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            预览
          </Button>
          <Button
            variant={viewMode === 'split' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            className="h-7 px-2 text-xs"
          >
            <Columns2 className="h-3.5 w-3.5 mr-1" />
            分屏
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative" style={{ minHeight: editorHeight }}>
        {/* Edit Mode */}
        {viewMode === 'edit' && (
          <div className="h-full">
            <CodeMirror
              value={content}
              height={editorHeight}
              theme={oneDark}
              extensions={[
                markdown({ codeLanguages: languages }),
                saveShortcut,
              ]}
              onChange={handleChange}
              placeholder={placeholder}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                autocompletion: true,
                foldGutter: true,
                allowMultipleSelections: true,
              }}
              className="h-full"
            />
          </div>
        )}

        {/* Preview Mode */}
        {viewMode === 'preview' && (
          <div className="h-full overflow-auto bg-background">
            <div className="max-w-3xl mx-auto p-8">
              {content ? (
                <EditorPreview content={content} />
              ) : (
                <div className="text-center text-muted-foreground py-20">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>开始写作，预览将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Split Mode */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-2 h-full divide-x">
            <div className="h-full overflow-auto">
              <CodeMirror
                value={content}
                height={editorHeight}
                theme={oneDark}
                extensions={[
                  markdown({ codeLanguages: languages }),
                  saveShortcut,
                ]}
                onChange={handleChange}
                placeholder={placeholder}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  autocompletion: true,
                  foldGutter: true,
                  allowMultipleSelections: true,
                }}
              />
            </div>
            <div className="h-full overflow-auto bg-background">
              <div className="p-6">
                <EditorPreview content={content} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{content.length} 字符</span>
          <span>{content.split(/\s+/).filter(Boolean).length} 词</span>
          <span>约 {Math.ceil(content.length / 400)} 分钟阅读</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">支持 Markdown</span>
          <span className="text-border">|</span>
          <span>Cmd+S 保存</span>
        </div>
      </div>
    </div>
  )
}
