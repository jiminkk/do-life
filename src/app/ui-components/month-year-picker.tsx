"use client"

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => CURRENT_YEAR - i,
)

const PICKER_CLASS =
  "outline-none rounded text-xs text-stone-400 border border-stone-300 py-0.5 text-center"

interface MonthYearPickerProps {
  month: string // "01"–"12" or ""
  year: string // "YYYY" or ""
  onMonthChange: (m: string) => void
  onYearChange: (y: string) => void
}

export const MonthYearPicker = ({
  month,
  year,
  onMonthChange,
  onYearChange,
}: MonthYearPickerProps) => (
  <div className="flex items-center gap-1">
    <select
      value={month}
      onChange={(e) => onMonthChange(e.target.value)}
      className={`${PICKER_CLASS} w-14`}
    >
      <option value="">MM</option>
      {MONTHS.map((name, i) => (
        <option key={i} value={String(i + 1).padStart(2, "0")}>
          {name}
        </option>
      ))}
    </select>
    <select
      value={year}
      onChange={(e) => onYearChange(e.target.value)}
      className={`${PICKER_CLASS} w-16`}
    >
      <option value="">YYYY</option>
      {YEARS.map((y) => (
        <option key={y} value={String(y)}>
          {y}
        </option>
      ))}
    </select>
  </div>
)
