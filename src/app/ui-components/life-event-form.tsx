"use client"

import { useState } from "react"
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

type LifeEventFormProps =
  | {
      mode: "editing"
      event: LifeEvent
      isEditing: boolean
      draft?: DraftEvent
      onDraftChange?: (field: string, value: string) => void
      onClick?: () => void
      onRemove?: () => void
    }
  | {
      mode: "new"
      onSubmit: (event: LifeEvent) => void
      onCancel: () => void
      onDataChange?: (data: {
        title: string
        description: string
        startMonth: string
        startYear: string
        endMonth: string
        endYear: string
      }) => void
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

export const LifeEventForm = (props: LifeEventFormProps) => {
  const now = new Date()
  const [localTitle, setLocalTitle] = useState("")
  const [localDescription, setLocalDescription] = useState("")
  const [localStartMonth, setLocalStartMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  )
  const [localStartYear, setLocalStartYear] = useState(
    String(now.getFullYear()),
  )
  const [localEndMonth, setLocalEndMonth] = useState("")
  const [localEndYear, setLocalEndYear] = useState("")
  const [localDateError, setLocalDateError] = useState("")

  const isNew = props.mode === "new"

  const title = isNew ? localTitle : (props.draft?.title ?? "")
  const description = isNew
    ? localDescription
    : (props.draft?.description ?? "")
  const startMonth = isNew ? localStartMonth : (props.draft?.startMonth ?? "")
  const startYear = isNew ? localStartYear : (props.draft?.startYear ?? "")
  const endMonth = isNew ? localEndMonth : (props.draft?.endMonth ?? "")
  const endYear = isNew ? localEndYear : (props.draft?.endYear ?? "")
  const dateError = isNew ? localDateError : (props.draft?.dateError ?? "")

  const handleChange = (field: string, value: string) => {
    if (isNew) {
      setLocalDateError("")
      if (field === "title") setLocalTitle(value)
      else if (field === "description") setLocalDescription(value)
      else if (field === "startMonth") setLocalStartMonth(value)
      else if (field === "startYear") setLocalStartYear(value)
      else if (field === "endMonth") setLocalEndMonth(value)
      else if (field === "endYear") setLocalEndYear(value)
      if (props.mode === "new" && props.onDataChange) {
        props.onDataChange({
          title: field === "title" ? value : localTitle,
          description: field === "description" ? value : localDescription,
          startMonth: field === "startMonth" ? value : localStartMonth,
          startYear: field === "startYear" ? value : localStartYear,
          endMonth: field === "endMonth" ? value : localEndMonth,
          endYear: field === "endYear" ? value : localEndYear,
        })
      }
    } else {
      props.onDraftChange?.(field, value)
    }
  }

  const handleNewSave = () => {
    if (!localTitle) {
      setLocalDateError("Title required")
      return
    }
    if (!localStartMonth || !localStartYear) {
      setLocalDateError("Start date required")
      return
    }
    if ((localEndMonth && !localEndYear) || (!localEndMonth && localEndYear)) {
      setLocalDateError("Complete the end date")
      return
    }
    if (localEndMonth && localEndYear) {
      const startVal = parseInt(localStartYear) * 12 + parseInt(localStartMonth)
      const endVal = parseInt(localEndYear) * 12 + parseInt(localEndMonth)
      if (endVal <= startVal) {
        setLocalDateError("End must be after start")
        return
      }
    }
    const startDate = `${localStartYear}-${localStartMonth}`
    const endDate =
      localEndMonth && localEndYear
        ? `${localEndYear}-${localEndMonth}`
        : undefined
    if (props.mode === "new") {
      props.onSubmit({
        title: localTitle,
        description: localDescription,
        startDate,
        endDate,
      })
    }
  }

  // Published view — shown when not in edit mode
  if (props.mode === "editing" && !props.isEditing) {
    return (
      <div
        className={`relative text-sm text-stone-500${props.onClick ? " cursor-pointer hover:bg-stone-50 rounded transition-colors" : ""}`}
        onClick={props.onClick}
      >
        <div className="absolute right-full top-0.5 pr-6 text-xs text-stone-400 text-right whitespace-nowrap">
          <p>
            {formatDate(props.event.startDate)} –{" "}
            {props.event.endDate ? formatDate(props.event.endDate) : "present"}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-stone-700">{props.event.title}</p>
          {props.event.description && <p>{props.event.description}</p>}
        </div>
      </div>
    )
  }

  // Editor — shown when isEditing=true or mode="new"
  return (
    <div className="relative text-sm text-stone-500">
      <div className="absolute right-full top-0 pr-6 flex flex-col gap-2">
        <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1">
          <span className="text-xs text-stone-400 text-right whitespace-nowrap">
            start*
          </span>
          <MonthYearPicker
            month={startMonth}
            year={startYear}
            onMonthChange={(m) => handleChange("startMonth", m)}
            onYearChange={(y) => handleChange("startYear", y)}
          />
          <span className="text-xs text-stone-400 text-right whitespace-nowrap">
            end
          </span>
          <MonthYearPicker
            month={endMonth}
            year={endYear}
            onMonthChange={(m) => handleChange("endMonth", m)}
            onYearChange={(y) => handleChange("endYear", y)}
          />
          {dateError && (
            <p className="col-span-2 text-red-400 text-xs text-right">
              {dateError}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          autoFocus={isNew}
          placeholder={"Life event title"}
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="outline-none border-b border-stone-300 focus:border-stone-500 bg-transparent w-full font-medium text-stone-700 pb-1 transition-colors"
        />
        <textarea
          placeholder={"Add more detail here"}
          value={description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="outline-none border rounded border-stone-300 focus:border-stone-500 bg-transparent w-full text-sm text-stone-500 px-2 py-2 transition-colors resize-none overflow-y-auto h-24"
          rows={3}
        />
        {props.mode === "editing" && props.onRemove && (
          <button
            type="button"
            onClick={props.onRemove}
            className="self-start text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            remove
          </button>
        )}
        {props.mode === "new" && !props.onDataChange && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNewSave}
              className={`py-1 text-xs rounded font-medium text-stone-400 hover:text-stone-600`}
            >
              Add
            </button>
            <button
              type="button"
              onClick={props.onCancel}
              className="py-1 text-xs rounded font-medium text-stone-400 hover:text-stone-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
