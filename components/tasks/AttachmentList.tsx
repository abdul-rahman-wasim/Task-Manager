'use client'

import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Attachment } from '@/hooks/useTasks'
import { Button } from '@/components/ui/Button'

interface AttachmentListProps {
  taskId: string
  attachments: Attachment[]
}

export function AttachmentList({ taskId, attachments }: AttachmentListProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const qc = useQueryClient()

  async function handleUpload(file: File) {
    setError('')
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Upload failed')
      } else {
        qc.invalidateQueries({ queryKey: ['tasks'] })
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(attachmentId: string) {
    const res = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, { method: 'DELETE' })
    if (res.ok) qc.invalidateQueries({ queryKey: ['tasks'] })
  }

  const isImage = (mime: string) => mime.startsWith('image/')

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Attachments ({attachments.length})
        </span>
        <Button variant="ghost" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
          + Add file
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {attachments.length === 0 && (
        <p className="text-xs text-gray-400">No attachments</p>
      )}

      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="group relative rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
          >
            {isImage(att.mimetype) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={att.url} alt={att.filename} className="h-16 w-16 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center bg-gray-50 dark:bg-gray-700 text-2xl">
                📄
              </div>
            )}
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              title={att.filename}
            />
            <button
              onClick={() => handleDelete(att.id)}
              className="absolute top-0.5 right-0.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs"
              aria-label={`Delete ${att.filename}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
