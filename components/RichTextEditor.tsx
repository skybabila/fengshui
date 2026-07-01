'use client'

import { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  bucket?: string
}

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center">
      <div className="text-stone-400">Loading editor...</div>
    </div>
  )
})

export default function RichTextEditor({ value, onChange, placeholder = 'Write your article content here...', bucket = 'articles' }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const quillEditorRef = useRef<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const editor = document.querySelector('.rich-text-editor .ql-editor')
      if (editor && quillEditorRef.current === null) {
        const quill = (window as any).Quill?.find(editor)
        if (quill) {
          quillEditorRef.current = quill
        }
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const insertImageAtCursor = useCallback((imageUrl: string) => {
    const quill = quillEditorRef.current
    if (quill) {
      const range = quill.getSelection()
      if (range) {
        quill.insertEmbed(range.index, 'image', imageUrl)
        quill.formatText(range.index + 1, 0, { 'align': 'center' })
        quill.insertText(range.index + 1, '\n\n')
        quill.setSelection(range.index + 3)
      } else {
        quill.insertEmbed(quill.getLength() - 1, 'image', imageUrl)
        quill.formatText(quill.getLength() - 1, 0, { 'align': 'center' })
        quill.insertText(quill.getLength(), '\n\n')
      }
    }
  }, [])

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = `${bucket}/${fileName}`

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        alert(`Upload failed: ${error.message}`)
        return
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
      
      if (urlData?.publicUrl) {
        insertImageAtCursor(urlData.publicUrl)
      }
    } catch {
      alert('Failed to upload image')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'indent',
    'link', 'image',
  ]

  return (
    <div className="rich-text-editor">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-stone-500">Click the button to insert images at your cursor position</p>
        <button
          type="button"
          onClick={handleImageUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Insert Image
        </button>
      </div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-xl"
      />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: #e7e5e4 !important;
          background: #fafaf9;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e7e5e4 !important;
          font-family: inherit;
          font-size: 1rem;
        }
        .rich-text-editor .ql-editor {
          min-height: 400px;
          line-height: 1.75;
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #a8a29e;
          font-style: normal;
        }
        .rich-text-editor .ql-snow .ql-picker {
          height: auto;
        }
        .rich-text-editor .ql-snow .ql-picker-options {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  )
}
