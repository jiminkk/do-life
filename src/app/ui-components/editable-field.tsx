"use client"

import { useState, useRef, useEffect } from "react"

interface EditableFieldProps {
  value: string
  onSave: (value: string) => void
  type?: "text" | "date"
  multiline?: boolean
  className?: string
}

export const EditableField = ({
  value,
  onSave,
  type = "text",
  multiline = false,
  className = "",
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
        adjustTextareaHeight()
      } else if (inputRef.current) {
        inputRef.current.focus()
        if (type === "text") {
          inputRef.current.select()
        }
      }
    }
  }, [isEditing, type, multiline])

  const handleClick = () => {
    setEditValue(value)
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
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
          onChange={(e) => {
            setEditValue(e.target.value)
            adjustTextareaHeight()
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`outline-none bg-stone-100 w-full rounded resize-none overflow-hidden`}
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

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:bg-stone-100 rounded px-1 -mx-1 transition-colors ${multiline ? "whitespace-pre-wrap block w-full" : ""} ${className}`}
    >
      {value}
    </span>
  )
}
