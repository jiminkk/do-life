"use client"

import { useState, useRef, useEffect } from "react"

interface EditableFieldProps {
  value: string
  onSave: (value: string) => void
  type?: "text" | "date"
  multiline?: boolean
  placeholder?: string
  className?: string
  onEditingChange?: (isEditing: boolean) => void
  editable?: boolean
}

export const EditableField = ({
  value,
  onSave,
  type = "text",
  multiline = false,
  placeholder = "",
  className = "",
  onEditingChange,
  editable = true,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (inputRef.current) {
        inputRef.current.focus()
        if (type === "text") {
          inputRef.current.select()
        }
      }
    }
  }, [isEditing, type, multiline])

  const handleClick = () => {
    if (!editable) return
    setEditValue(value)
    setIsEditing(true)
    onEditingChange?.(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    onEditingChange?.(false)
    if (editValue !== value) {
      onSave(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleBlur()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          value={editValue}
          placeholder={placeholder}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`outline-none bg-stone-100 rounded px-2 py-1 w-full resize-none overflow-y-auto h-24 ${className}`}
        />
      )
    }

    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`outline-none border-stone-400 rounded bg-stone-100 ${className}`}
      />
    )
  }

  if (multiline) {
    return (
      <span
        onClick={handleClick}
        className={`${
          editable ? "cursor-pointer" : "cursor-default"
        } block w-full min-h-6 whitespace-pre-wrap ${className}`}
      >
        {value || <span className="text-stone-400">{placeholder}</span>}
      </span>
    )
  }

  return (
    <span
      onClick={handleClick}
      className={`${
        editable
          ? "cursor-pointer bg-stone-100 rounded px-1 -mx-1 hover:bg-stone-200"
          : "cursor-default"
      } transition-colors ${className}`}
    >
      {value || <span className="text-stone-400">{placeholder}</span>}
    </span>
  )
}
