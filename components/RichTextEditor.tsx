'use client'

import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center">
      <div className="text-stone-400">Loading editor...</div>
    </div>
  )
})

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write your article content here...' }: RichTextEditorProps) {
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
          min-height: 300px;
          line-height: 1.75;
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
