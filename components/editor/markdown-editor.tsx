'use client'

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { EditorPreview } from './editor-preview'
import { useDebounce } from '@/lib/hooks'
import { Eye, Edit3, Save } from 'lucide-react'

interface MarkdownEditorProps {
  initialValue?: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
  height?: string
}

export function MarkdownEditor({
  initialValue = '',
  onChange,
  onSave,
  placeholder = '开始写作...',
  height = 'calc(100vh - 300px)',
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue)
  const [activeTab, setActiveTab] = useState('edit')

  const debouncedContent = useDebounce(content, 500)
  
  // 使用 useSyncExternalStore 避免 hydration 不匹配
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

  const handleChange = useCallback(
    (value: string) => {
      setContent(value)
    },
    []
  )

  // 插入 Markdown 语法
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('.cm-editor .cm-content') as HTMLElement
    if (!textarea) return

    const selection = window.getSelection()
    if (!selection) return

    const selectedText = selection.toString()
    const newText = before + selectedText + after

    // 使用 document.execCommand 插入文本
    document.execCommand('insertText', false, newText)
  }

  const toolbarButtons = [
    { label: 'H1', action: () => insertMarkdown('# ', ''), title: '标题 1' },
    { label: 'H2', action: () => insertMarkdown('## ', ''), title: '标题 2' },
    { label: 'H3', action: () => insertMarkdown('### ', ''), title: '标题 3' },
    { label: 'B', action: () => insertMarkdown('**', '**'), title: '加粗' },
    { label: 'I', action: () => insertMarkdown('*', '*'), title: '斜体' },
    { label: '"', action: () => insertMarkdown('> ', ''), title: '引用' },
    { label: '</>', action: () => insertMarkdown('```\n', '\n```'), title: '代码块' },
    { label: '—', action: () => insertMarkdown('---\n', ''), title: '分隔线' },
  ]

  if (!mounted) {
    return (
      <div
        className="bg-[#282c34] rounded-lg animate-pulse"
        style={{ height }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.label}
              variant="ghost"
              size="sm"
              onClick={btn.action}
              title={btn.title}
              className="h-8 w-8 p-0 font-mono"
            >
              {btn.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {content.length} 字符
          </span>
          {onSave && (
            <Button size="sm" onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 px-4">
          <TabsTrigger value="edit" className="gap-2">
            <Edit3 className="h-4 w-4" />
            编辑
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            预览
          </TabsTrigger>
          <TabsTrigger value="split" className="gap-2">
            <Edit3 className="h-4 w-4" />
            分屏
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-0 h-full">
          <CodeMirror
            value={content}
            height={height}
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
        </TabsContent>

        <TabsContent value="preview" className="mt-0 h-full overflow-auto">
          <div className="p-6">
            <EditorPreview content={content} />
          </div>
        </TabsContent>

        <TabsContent value="split" className="mt-0 h-full">
          <div className="grid grid-cols-2 h-full divide-x">
            <CodeMirror
              value={content}
              height={height}
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
            <div className="overflow-auto p-6 bg-background">
              <EditorPreview content={content} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
