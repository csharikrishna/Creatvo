'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useCallback, useRef } from 'react'
import {
  Bold, Italic, List, ListOrdered, Quote, Code2,
  Link2, Image as ImageIcon, Heading1, Heading2, Heading3,
  Strikethrough, Undo, Redo, AlignLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichEditor({ content, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: 'language-' },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-violet underline hover:text-brand-accent transition-colors',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your story...',
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] text-white/80 leading-relaxed',
      },
      handlePaste: (view, event) => {
        // Handle pasted images
        const items = Array.from(event.clipboardData?.items || [])
        const imageItem = items.find(i => i.type.startsWith('image/'))
        if (imageItem) {
          event.preventDefault()
          const file = imageItem.getAsFile()
          if (file) {
            uploadAndInsertImage(file)
            return true
          }
        }
        return false
      },
    },
    immediatelyRender: false,
  })

  const uploadAndInsertImage = useCallback(async (file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image must be under 1MB')
      return
    }

    const toastId = toast.loading('Uploading image...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Not authenticated', { id: toastId }); return }

      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('article-images')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path)

      editor?.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
      toast.success('Image uploaded!', { id: toastId })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg, { id: toastId })
    }
  }, [editor, supabase])

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  const ToolButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        active
          ? 'bg-brand-purple/20 text-brand-violet'
          : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolButton>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolButton>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <Code2 className="h-4 w-4" />
        </ToolButton>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <ToolButton onClick={setLink} active={editor.isActive('link')} title="Add Link">
          <Link2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => fileInputRef.current?.click()} active={false} title="Upload Image">
          <ImageIcon className="h-4 w-4" />
        </ToolButton>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <ToolButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          <Undo className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          <Redo className="h-4 w-4" />
        </ToolButton>

        <div className="ml-auto text-xs text-white/25">
          {editor.storage.characterCount.words()} words
        </div>
      </div>

      {/* Editor */}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) uploadAndInsertImage(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
