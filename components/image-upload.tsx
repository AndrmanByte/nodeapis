"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { uploadImage } from "@/lib/upload"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label: React.ReactNode
  hint?: string
  aspect?: "square" | "wide"
}

export function ImageUpload({ value, onChange, label, hint, aspect = "wide" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return
    setUploading(true)
    setError("")
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch {
      setError("上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {value ? (
        <div className="relative group">
          <div className={`overflow-hidden rounded-lg border border-border ${aspect === "square" ? "aspect-square w-32" : "aspect-video w-full"}`}>
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <Button size="sm" variant="secondary" onClick={() => onChange("")} className="gap-1">
              <X className="h-3.5 w-3.5" /> 移除
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer ${aspect === "square" ? "w-32 aspect-square" : "w-full aspect-video"}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground">点击或拖拽上传</span>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
