'use client'

import { useState, useCallback, useEffect, useSyncExternalStore, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { githubLight } from '@uiw/codemirror-theme-github'
import { languages } from '@codemirror/language-data'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { Button } from '@/components/ui/button'
import { EditorPreview } from './editor-preview'
import { useDebounce } from '@/lib/hooks'
import { 
  Eye, 
  Edit3, 
  Columns2, 
  Bold, 
  Italic, 
  Quote, 
  Code, 
  Minus, 
  List,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'

interface MarkdownEditorProps {
  initialValue?: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
}

type ViewMode = 'edit' | 'preview' | 'split'

export function MarkdownEditor({
  initialValue = '',
  onChange,
  onSave,
  placeholder = '开始写作，支持 Markdown 语法...',
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedContent = useDebounce(content, 500)
  
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

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
    
    const newText = before + (selectedText || '') + after
    
    range.deleteContents()
    const textNode = document.createTextNode(newText)
    range.insertNode(textNode)
    
    const newContent = editor.textContent || ''
    setContent(newContent)
  }

  const toolbarItems = [
    { icon: Heading1, action: () => insertMarkdown('# ', ''), title: '一级标题' },
    { icon: Heading2, action: () => insertMarkdown('## ', ''), title: '二级标题' },
    { icon: Heading3, action: () => insertMarkdown('### ', ''), title: '三级标题' },
    null,
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: '加粗' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: '斜体' },
    null,
    { icon: Quote, action: () => insertMarkdown('> ', ''), title: '引用' },
    { icon: Code, action: () => insertMarkdown('```\n', '\n```'), title: '代码块' },
    { icon: List, action: () => insertMarkdown('- ', ''), title: '列表' },
    { icon: Minus, action: () => insertMarkdown('---\n', ''), title: '分隔线' },
  ]

  if (!mounted) {
    return (
      <div className="h-full bg-muted/30 animate-pulse" />
    )
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full bg-background"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          {toolbarItems.map((item, index) => (
            item === null ? (
              <div key={index} className="w-px h-5 bg-border mx-1" />
            ) : (
              <Button
                key={item.title}
                variant="ghost"
                size="icon"
                onClick={item.action}
                title={item.title}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
              </Button>
            )
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          <Button
            variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            编辑
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            预览
          </Button>
          <Button
            variant={viewMode === 'split' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Columns2 className="h-3.5 w-3.5" />
            分屏
          </Button>
        </div>
      </div>

      {/* Editor Content - 占满剩余空间 */}
      <div className="flex-1 overflow-hidden">
        {/* Edit Mode */}
        {viewMode === 'edit' && (
          <div className="h-full">
            <CodeMirror
              value={content}
              height="100%"
              theme={githubLight}
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
              className="h-full text-[15px] leading-7 [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-[15px] [&_.cm-scroller]:leading-7"
            />
          </div>
        )}

        {/* Preview Mode */}
        {viewMode === 'preview' && (
          <div className="h-full overflow-auto bg-background">
            <div className="max-w-3xl mx-auto p-8 lg:p-10">
              {content ? (
                <EditorPreview content={content} />
              ) : (
                <div className="text-center text-muted-foreground py-20">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
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
                height="100%"
                theme={githubLight}
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
                className="h-full text-[15px] leading-7 [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-[15px] [&_.cm-scroller]:leading-7"
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
      <div className="flex items-center justify-between px-4 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{content.length} 字符</span>
          <span>{content.split(/\s+/).filter(Boolean).length} 词</span>
          <span className="hidden sm:inline">约 {Math.max(1, Math.ceil(content.length / 400))} 分钟阅读</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Markdown</span>
          <span className="text-border">|</span>
          <span>Cmd+S 保存</span>
        </div>
      </div>
    </div>
  )
}
