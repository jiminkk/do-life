"use client"

import { useRef, useState } from "react"

interface AvatarProps {
  username: string
  editable?: boolean
  src?: string
  onImageSelect?: (file: File) => void
}

export const Avatar = ({
  username,
  editable = false,
  src,
  onImageSelect,
}: AvatarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(src ?? null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onImageSelect?.(file)
  }

  const inner = preview ? (
    <img src={preview} alt={username} className="w-full h-full object-cover" />
  ) : (
    <span className="text-stone-500 font-medium text-lg select-none">
      {username.charAt(0).toUpperCase()}
    </span>
  )

  if (editable) {
    return (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center shrink-0 overflow-hidden hover:opacity-75 transition-opacity cursor-pointer"
      >
        {inner}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </button>
    )
  }

  return (
    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center shrink-0 overflow-hidden">
      {inner}
    </div>
  )
}
