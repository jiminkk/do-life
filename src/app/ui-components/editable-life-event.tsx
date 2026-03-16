"use client"

import { LifeEvent } from "./life-event-input"
import { MonthYearPicker } from "./month-year-picker"

export type DraftEvent = {
  title: string
  description: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  dateError: string
}

interface EditableLifeEventProps {
  event: LifeEvent
  isEditing?: boolean
  draft?: DraftEvent
  onDraftChange?: (field: string, value: string) => void
}

const formatDate = (dateStr: string) => {
  const [year, month] = dateStr.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export const EditableLifeEvent = ({
  event,
  isEditing = false,
  draft,
  onDraftChange,
}: EditableLifeEventProps) => {
  if (isEditing && draft && onDraftChange) {
    return (
      <div className="relative text-sm text-stone-500">
        <div className="absolute right-full top-0 pr-6 flex flex-col gap-1">
          <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1">
            <span className="text-xs text-stone-400 text-right whitespace-nowrap">
              start*
            </span>
            <MonthYearPicker
              month={draft.startMonth}
              year={draft.startYear}
              onMonthChange={(m) => onDraftChange("startMonth", m)}
              onYearChange={(y) => onDraftChange("startYear", y)}
            />
            <span className="text-xs text-stone-400 text-right whitespace-nowrap">
              end
            </span>
            <MonthYearPicker
              month={draft.endMonth}
              year={draft.endYear}
              onMonthChange={(m) => onDraftChange("endMonth", m)}
              onYearChange={(y) => onDraftChange("endYear", y)}
            />
            {draft.dateError && (
              <p className="col-span-2 text-red-400 text-xs text-right">
                {draft.dateError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => onDraftChange("title", e.target.value)}
            className="outline-none border-b border-stone-300 focus:border-stone-500 bg-transparent w-full font-medium text-stone-700 pb-1 transition-colors"
          />
          <textarea
            value={draft.description}
            onChange={(e) => onDraftChange("description", e.target.value)}
            className="outline-none border rounded border-stone-300 focus:border-stone-500 bg-transparent w-full text-sm text-stone-500 pb-1 transition-colors resize-none overflow-y-auto h-24"
            rows={3}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative text-sm text-stone-500">
      <div className="absolute right-full top-0 pr-6 text-xs text-stone-400 text-right whitespace-nowrap">
        <p>
          {formatDate(event.startDate)} –{" "}
          {event.endDate ? formatDate(event.endDate) : "present"}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-stone-700">{event.title}</p>
        {event.description && <p>{event.description}</p>}
      </div>
    </div>
  )
}
