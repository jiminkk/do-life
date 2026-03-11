"use client"

import { useState } from "react"
import { LifeEvent } from "./life-event-input"

interface EditableLifeEventProps {
  event: LifeEvent
  onUpdate: (updated: LifeEvent) => void
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-stone-400 font-medium">{children}</span>
)

const INPUT_CLASS =
  "outline-none bg-stone-100 rounded px-2 py-1 w-full text-sm text-stone-500"
const DATE_INPUT_CLASS =
  "outline-none bg-stone-100 rounded px-2 py-1 text-sm text-stone-500"

const toDateString = (date: Date) => date.toISOString().split("T")[0]

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

export const EditableLifeEvent = ({
  event,
  onUpdate,
}: EditableLifeEventProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleStartEditing = () => {
    setTitle(event.title)
    setDescription(event.description)
    setStartDate(toDateString(event.startDate))
    setEndDate(event.endDate ? toDateString(event.endDate) : "")
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate({
      ...event,
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4 text-sm text-stone-500">
        <div className="flex flex-col gap-1">
          <FieldLabel>Title</FieldLabel>
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Description</FieldLabel>
          <textarea
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
            onClick={handleCancel}
            className="px-3 py-1 text-xs font-medium rounded border border-stone-300 text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative text-sm text-stone-500">
      <div className="absolute right-full top-0 pr-6 text-xs text-stone-400 text-right whitespace-nowrap">
        <p>{formatDate(event.startDate)}</p>
        <p>{event.endDate ? `– ${formatDate(event.endDate)}` : "– present"}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-stone-700">{event.title}</p>
        {event.description && <p>{event.description}</p>}
        <button
          type="button"
          onClick={handleStartEditing}
          className="inline-flex items-center gap-1 self-start px-2 py-1 text-xs font-medium text-stone-600 border border-stone-300 rounded hover:bg-stone-100"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 13.5L4.5 11L11.5 4L14 6.5L7 13.5L4 13.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 4.5L12 2L15.5 5.5L13 8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </button>
      </div>
    </div>
  )
}
