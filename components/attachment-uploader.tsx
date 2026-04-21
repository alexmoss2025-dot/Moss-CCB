'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, Loader2, FileIcon } from 'lucide-react'

export type AttachmentMeta = {
  fileName: string
  contentType: string
  fileSize: number
  cloud_storage_path: string
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function AttachmentUploader({
  attachments,
  onChange,
}: {
  attachments: AttachmentMeta[]
  onChange: (next: AttachmentMeta[]) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const next: AttachmentMeta[] = [...(attachments ?? [])]
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)
        if (!file) continue
        if (file.size > MAX_SIZE_BYTES) {
          toast.error(`"${file.name}" is larger than 50MB and was skipped`)
          continue
        }
        setProgress({ name: file.name, pct: 0 })
        const presignRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream' }),
        })
        const presignData = await presignRes.json().catch(() => ({}))
        if (!presignRes.ok || !presignData?.uploadUrl) {
          toast.error(`Failed to get upload URL for "${file.name}"`)
          continue
        }

        const uploadOk = await new Promise<boolean>((resolve) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', presignData.uploadUrl)
          if (file.type) xhr.setRequestHeader('Content-Type', file.type)
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress({ name: file.name, pct: Math.round((ev.loaded / ev.total) * 100) })
            }
          }
          xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300)
          xhr.onerror = () => resolve(false)
          xhr.send(file)
        })
        if (!uploadOk) {
          toast.error(`Upload failed for "${file.name}"`)
          continue
        }

        next.push({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          fileSize: file.size,
          cloud_storage_path: presignData.cloud_storage_path,
        })
      }
      onChange(next)
      setProgress(null)
    } catch (err) {
      console.error(err)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove(index: number) {
    const next = (attachments ?? []).filter((_, i) => i !== index)
    onChange(next)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => inputRef.current?.click?.()}
        onDragOver={(e) => { e.preventDefault() }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer?.files) }}
        role="button"
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-5 w-5" />
        </div>
        <div className="mt-3 text-sm font-medium">Click to upload or drag & drop</div>
        <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, PNG, JPG • up to 50MB per file</div>
        <Button type="button" size="sm" variant="outline" className="mt-4" onClick={(e) => { e.stopPropagation(); inputRef.current?.click?.() }} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading…' : 'Select files'}
        </Button>
      </div>

      {progress ? (
        <div className="mt-3 rounded-md bg-muted p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="truncate">{progress.name}</span>
            <span className="font-mono">{progress.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-background overflow-hidden">
            <div className="h-full bg-primary transition-all duration-fast" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      ) : null}

      {Array.isArray(attachments) && attachments.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {attachments.map((a, i) => (
            <li key={a.cloud_storage_path ?? i} className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-primary shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{a.fileName}</div>
                <div className="text-xs text-muted-foreground">{formatSize(a.fileSize)}</div>
              </div>
              <button type="button" className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => remove(i)}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
