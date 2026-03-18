"use client"

import {
  Avatar,
  BioInput,
  Container,
  LifeEventForm,
  LifeEvent,
  Main,
} from "@/app/ui-components"
import type { DraftEvent } from "@/app/ui-components"
import { ProfileData } from "@/app/types/types"
import {
  updateBio,
  addLifeEvent,
  updateLifeEvent,
  deleteLifeEvent,
  syncAvatar,
  uploadAvatar,
} from "@/app/actions/profile"
import { useState, useRef, useCallback } from "react"

interface EditProfileProps {
  initialProfile: ProfileData | null
  username: string
  avatarUrl: string | null
}

const toDrafts = (events: LifeEvent[]): DraftEvent[] =>
  events.map((e) => {
    const [sy, sm] = e.startDate.split("-")
    const [ey, em] = e.endDate ? e.endDate.split("-") : ["", ""]
    return {
      title: e.title,
      description: e.description,
      startMonth: sm ?? "",
      startYear: sy ?? "",
      endMonth: em ?? "",
      endYear: ey ?? "",
      dateError: "",
    }
  })

export const EditProfile = ({ initialProfile, username, avatarUrl }: EditProfileProps) => {
  const initialEvents: LifeEvent[] = (initialProfile?.lifeEvents ?? []).map(
    (r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      startDate: r.startDate,
      endDate: r.endDate ?? undefined,
      section: r.section,
    }),
  )

  const [bio, setBio] = useState(initialProfile?.bio ?? "")
  const [showSaved, setShowSaved] = useState(false)
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(initialEvents)
  const [drafts, setDrafts] = useState<DraftEvent[]>(() =>
    toDrafts(initialEvents),
  )
  const [isEditingAll, setIsEditingAll] = useState(false)
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const savedSnapshot = useRef<LifeEvent[]>(lifeEvents)

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      uploadAvatar(dataUrl).catch(() => {})
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemove = (index: number) => {
    const event = lifeEvents[index]
    if (event.id) setRemovedIds((prev) => [...prev, event.id!])
    setLifeEvents((prev) => prev.filter((_, i) => i !== index))
    setDrafts((prev) => prev.filter((_, i) => i !== index))
  }

  const onBioSubmit = async (data: { bio: string }) => {
    setBio(data.bio)
    await updateBio(data.bio)
  }

  const triggerSavedToast = () => {
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleDraftChange = (index: number, field: string, value: string) => {
    setDrafts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value, dateError: "" }
      return next
    })
  }

  const handleSave = async () => {
    let hasError = false
    const validated = [...drafts]
    drafts.forEach((draft, i) => {
      if (!draft.title) {
        hasError = true
        validated[i] = { ...draft, dateError: "Title required" }
        return
      }
      if (!draft.startMonth || !draft.startYear) {
        hasError = true
        validated[i] = { ...draft, dateError: "Start date required" }
        return
      }
      if (
        (draft.endMonth && !draft.endYear) ||
        (!draft.endMonth && draft.endYear)
      ) {
        hasError = true
        validated[i] = { ...draft, dateError: "Complete the end date" }
        return
      }
      if (draft.endMonth && draft.endYear) {
        const startVal =
          parseInt(draft.startYear) * 12 + parseInt(draft.startMonth)
        const endVal = parseInt(draft.endYear) * 12 + parseInt(draft.endMonth)
        if (endVal <= startVal) {
          hasError = true
          validated[i] = { ...draft, dateError: "End must be after start" }
          return
        }
      }
    })

    if (hasError) {
      setDrafts(validated)
      return
    }

    const updatedEvents = lifeEvents.map((event, i) => {
      const draft = drafts[i]
      const startDate = `${draft.startYear}-${draft.startMonth}`
      const endDate =
        draft.endMonth && draft.endYear
          ? `${draft.endYear}-${draft.endMonth}`
          : undefined
      return {
        ...event,
        title: draft.title,
        description: draft.description,
        startDate,
        endDate,
        section: undefined,
      }
    })

    setLifeEvents(updatedEvents)
    setDrafts(toDrafts(updatedEvents))
    setIsEditingAll(false)
    triggerSavedToast()

    for (const id of removedIds) {
      await deleteLifeEvent(id)
    }
    setRemovedIds([])

    const savedEvents: LifeEvent[] = []
    for (const event of updatedEvents) {
      if (event.id) {
        await updateLifeEvent({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          section: undefined,
        })
        savedEvents.push(event)
      } else {
        const { id } = await addLifeEvent({
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
        })
        savedEvents.push({ ...event, id })
      }
    }
    setLifeEvents(savedEvents)
    setDrafts(toDrafts(savedEvents))
    savedSnapshot.current = savedEvents

    // Sync avatar in the background — don't block the save
    syncAvatar().catch(() => {})
  }

  const handleAddBlank = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = String(now.getFullYear())
    const blankEvent: LifeEvent = {
      title: "",
      description: "",
      startDate: `${year}-${month}`,
    }
    setLifeEvents((prev) => [...prev, blankEvent])
    setDrafts((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        startMonth: month,
        startYear: year,
        endMonth: "",
        endYear: "",
        dateError: "",
      },
    ])
  }

  return (
    <Main username={username}>
      <Container>
        <main className="flex-1 pb-10 w-full">
          <div className="relative">
            <div className="absolute right-full top-0 pr-6">
              <Avatar username={username} editable src={avatarUrl ?? undefined} onImageSelect={handleImageSelect} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-stone-700">@{username}</p>
              <BioInput bio={bio} onSubmit={onBioSubmit} />
            </div>
          </div>
        </main>

        {!isEditingAll && lifeEvents.length > 0 && (
          <div className="relative">
            <div className="absolute right-full top-0 pr-6">
              <button
                type="button"
                onClick={() => {
                  savedSnapshot.current = lifeEvents
                  setIsEditingAll(true)
                }}
                className="flex hover:text-stone-700 items-center justify-center gap-0.5 text-xs text-stone-400 transition-colors whitespace-nowrap"
              >
                {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    width="14px"
                    height="14px"
                    fill="currentColor"
                  >
                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                  </svg> */}
                <p>Edit</p>
              </button>
            </div>
          </div>
        )}

        <main className="flex flex-col gap-10 w-full">
          {!isEditingAll && lifeEvents.length === 0 && (
            <button
              type="button"
              onClick={() => {
                savedSnapshot.current = lifeEvents
                setIsEditingAll(true)
                handleAddBlank()
              }}
              className="self-start text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              + Add event
            </button>
          )}
          <div className="flex flex-col gap-8">
            {lifeEvents.map((event, i) => {
              const draft = drafts[i]
              const displayEvent = draft
                ? {
                    ...event,
                    title: draft.title,
                    description: draft.description,
                    startDate:
                      draft.startYear && draft.startMonth
                        ? `${draft.startYear}-${draft.startMonth}`
                        : event.startDate,
                    endDate:
                      draft.endYear && draft.endMonth
                        ? `${draft.endYear}-${draft.endMonth}`
                        : undefined,
                  }
                : event
              return (
                <LifeEventForm
                  key={event.id ?? `${event.title}-${i}`}
                  mode="editing"
                  event={displayEvent}
                  isEditing={isEditingAll}
                  draft={drafts[i]}
                  onDraftChange={(field, value) =>
                    handleDraftChange(i, field, value)
                  }
                  onRemove={() => handleRemove(i)}
                />
              )
            })}
          </div>
          {isEditingAll && (
            <>
              <button
                type="button"
                onClick={handleAddBlank}
                className="self-start text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                + Add event
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1 text-xs font-medium rounded bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLifeEvents(savedSnapshot.current)
                    setDrafts(toDrafts(savedSnapshot.current))
                    setRemovedIds([])
                    setIsEditingAll(false)
                  }}
                  className="px-3 py-1 text-xs font-medium rounded text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </main>
      </Container>

      {showSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none">
          Saved
        </div>
      )}
    </Main>
  )
}
