"use client"

import { useState } from "react"
import { LifeEvent } from "./life-event-input"

interface NewLifeEventProps {
  onSubmit: (event: LifeEvent) => void
  onCancel: () => void
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-stone-400 font-medium">{children}</span>
)

const INPUT_CLASS = "outline-none bg-stone-100 rounded px-2 py-1 w-full text-sm text-stone-500"
const DATE_INPUT_CLASS = "outline-none bg-stone-100 rounded px-2 py-1 text-sm text-stone-500"

export const NewLifeEvent = ({ onSubmit, onCancel }: NewLifeEventProps) => {
  const today = new Date().toISOString().split("T")[0]
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState("")

  const handleSave = () => {
    if (!title || !startDate) return
    onSubmit({
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 text-sm text-stone-500">
      <div className="flex flex-col gap-1">
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          placeholder="Life event title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Description</FieldLabel>
        <textarea
          placeholder="Add more detail here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${INPUT_CLASS} resize-none overflow-y-auto h-24`}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1">
        <FieldLabel>Dates</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={DATE_INPUT_CLASS}
          />
          <span>–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={DATE_INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!title}
          className={`px-3 py-1 text-xs font-medium rounded ${
            title
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-stone-200 text-stone-500 cursor-not-allowed"
          }`}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs font-medium rounded border border-stone-300 text-stone-600 hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
