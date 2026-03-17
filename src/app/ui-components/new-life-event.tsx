"use client"

import { useState } from "react"
import { LifeEvent } from "./life-event-input"
import { MonthYearPicker } from "./month-year-picker"

interface NewLifeEventProps {
  onSubmit: (event: LifeEvent) => void
  onCancel: () => void
}

const INPUT_CLASS =
  "outline-none border rounded border-stone-300 focus:border-stone-500 bg-transparent w-full text-sm text-stone-500 pb-1 transition-colors"

export const NewLifeEvent = ({ onSubmit, onCancel }: NewLifeEventProps) => {
  const now = new Date()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startMonth, setStartMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  )
  const [startYear, setStartYear] = useState(String(now.getFullYear()))
  const [endMonth, setEndMonth] = useState("")
  const [endYear, setEndYear] = useState("")
  const [dateError, setDateError] = useState("")

  const clearDateError = () => setDateError("")

  const handleSave = () => {
    if (!title) return
    if (!startMonth || !startYear) {
      setDateError("Start date required")
      return
    }
    if ((endMonth && !endYear) || (!endMonth && endYear)) {
      setDateError("Complete the end date")
      return
    }
    if (endMonth && endYear) {
      const startVal = parseInt(startYear) * 12 + parseInt(startMonth)
      const endVal = parseInt(endYear) * 12 + parseInt(endMonth)
      if (endVal <= startVal) {
        setDateError("End must be after start")
        return
      }
    }
    const startDate = `${startYear}-${startMonth}`
    const endDate = endMonth && endYear ? `${endYear}-${endMonth}` : undefined
    onSubmit({ title, description, startDate, endDate })
  }

  return (
    <div className="relative text-sm text-stone-500">
      <div className="absolute right-full top-0 pr-6 flex flex-col gap-1">
        <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1">
          <span className="text-xs text-stone-400 text-right whitespace-nowrap">
            start*
          </span>
          <MonthYearPicker
            month={startMonth}
            year={startYear}
            onMonthChange={(m) => {
              setStartMonth(m)
              clearDateError()
            }}
            onYearChange={(y) => {
              setStartYear(y)
              clearDateError()
            }}
          />
          <span className="text-xs text-stone-400 text-right whitespace-nowrap">
            end
          </span>
          <MonthYearPicker
            month={endMonth}
            year={endYear}
            onMonthChange={(m) => {
              setEndMonth(m)
              clearDateError()
            }}
            onYearChange={(y) => {
              setEndYear(y)
              clearDateError()
            }}
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
          placeholder="Life event title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="outline-none border-b border-stone-300 focus:border-stone-500 bg-transparent w-full font-medium text-stone-700 pb-1 transition-colors"
        />
        <textarea
          placeholder="Add more detail here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${INPUT_CLASS} resize-none overflow-y-auto h-24 px-2 py-2`}
          rows={3}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!title}
            className={`px-3 py-1 text-xs font-medium rounded ${
              title
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-stone-200 text-stone-500 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
