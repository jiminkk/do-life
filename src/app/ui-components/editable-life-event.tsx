"use client"

import { LifeEvent } from "./life-event-input"
import { EditableField } from "./editable-field"

interface EditableLifeEventProps {
  event: LifeEvent
  onUpdate: (updated: LifeEvent) => void
}

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString()
}

export const EditableLifeEvent = ({ event, onUpdate }: EditableLifeEventProps) => {
  const handleFieldUpdate = (field: keyof LifeEvent, value: string) => {
    if (field === "startDate" || field === "endDate") {
      const dateValue = value ? new Date(value) : undefined
      onUpdate({ ...event, [field]: dateValue })
    } else {
      onUpdate({ ...event, [field]: value })
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-stone-500">
      <h3>
        <EditableField
          value={event.title}
          onSave={(v) => handleFieldUpdate("title", v)}
        />
      </h3>
      <p>
        <EditableField
          value={event.description}
          onSave={(v) => handleFieldUpdate("description", v)}
          multiline
        />
      </p>
      <p>
        <EditableField
          value={formatDateForInput(event.startDate)}
          onSave={(v) => handleFieldUpdate("startDate", v)}
          type="date"
        />
        {" - "}
        {event.endDate ? (
          <EditableField
            value={formatDateForInput(event.endDate)}
            onSave={(v) => handleFieldUpdate("endDate", v)}
            type="date"
          />
        ) : (
          <EditableField
            value=""
            onSave={(v) => handleFieldUpdate("endDate", v)}
            type="date"
          />
        )}
      </p>
    </div>
  )
}
