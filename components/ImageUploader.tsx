'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  bucket?: string
}

export default function ImageUploader({ value, onChange, bucket = 'articles' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Generate unique file name
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = `${bucket}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        alert(`Upload failed: ${error.message}`)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
      
      if (urlData?.publicUrl) {
        onChange(urlData.publicUrl)
        setPreview(urlData.publicUrl)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
    setPreview('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">Cover Image</label>
      
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-stone-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-2" />
              <p className="text-stone-500 text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-stone-400 mb-2" />
              <p className="text-stone-600 font-medium">Click to upload image</p>
              <p className="text-stone-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
        </div>
      )}

      {/* Alternative: URL input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <ImageIcon className="w-4 h-4 text-stone-400" />
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setPreview(e.target.value)
          }}
          className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Or paste image URL"
        />
      </div>
    </div>
  )
}
