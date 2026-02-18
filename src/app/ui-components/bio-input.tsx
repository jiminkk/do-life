"use client"

import { EditableField } from "./editable-field"

interface BioInputProps {
  bio: string
  onSubmit: (data: { bio: string }) => void
}

export const BioInput = ({ bio, onSubmit }: BioInputProps) => {
  const handleSave = (value: string) => {
    onSubmit({ bio: value })
  }

  return (
    <EditableField
      value={bio}
      onSave={handleSave}
      multiline
      className="block w-full"
    />
  )
}
