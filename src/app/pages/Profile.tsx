"use client"

import {
  BioInput,
  Container,
  LifeEventForm,
  LifeEvent,
  Main,
} from "@/app/ui-components"
import type { DraftEvent } from "@/app/ui-components"
import { ProfileData } from "@/app/types/types"
import { updateBio, addLifeEvent, updateLifeEvent } from "@/app/actions/profile"
import { useState } from "react"

interface ProfileProps {
  initialProfile: ProfileData | null
  username: string
  isOwner: boolean
}

export const Profile = ({
  initialProfile,
  username,
  isOwner,
}: ProfileProps) => {
  const [bio, setBio] = useState(initialProfile?.bio ?? "")
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(
    (initialProfile?.lifeEvents ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      startDate: r.startDate,
      endDate: r.endDate,
    })),
  )
  const [isEditingAll, setIsEditingAll] = useState(false)
  const [drafts, setDrafts] = useState<DraftEvent[]>([])

  const onBioSubmit = async (data: { bio: string }) => {
    setBio(data.bio)
    await updateBio(data.bio)
  }

  const onLifeEventSubmit = async (data: LifeEvent) => {
    setShowNewEvent(false)
    const { id } = await addLifeEvent({
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    })
    setLifeEvents((prev) => [...prev, { ...data, id }])
  }

  const handleEditAll = () => {
    setDrafts(
      lifeEvents.map((e) => {
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
      }),
    )
    setIsEditingAll(true)
  }

  const handleDraftChange = (index: number, field: string, value: string) => {
    setDrafts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value, dateError: "" }
      return next
    })
  }

  const handleSaveAll = async () => {
    let hasError = false
    const validated = drafts.map((draft) => {
      if (!draft.title) {
        hasError = true
        return { ...draft, dateError: "Title required" }
      }
      if (!draft.startMonth || !draft.startYear) {
        hasError = true
        return { ...draft, dateError: "Start date required" }
      }
      if ((draft.endMonth && !draft.endYear) || (!draft.endMonth && draft.endYear)) {
        hasError = true
        return { ...draft, dateError: "Complete the end date" }
      }
      if (draft.endMonth && draft.endYear) {
        const startVal = parseInt(draft.startYear) * 12 + parseInt(draft.startMonth)
        const endVal = parseInt(draft.endYear) * 12 + parseInt(draft.endMonth)
        if (endVal <= startVal) {
          hasError = true
          return { ...draft, dateError: "End must be after start" }
        }
      }
      return draft
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
      return { ...event, title: draft.title, description: draft.description, startDate, endDate }
    })

    setLifeEvents(updatedEvents)
    setIsEditingAll(false)

    for (const event of updatedEvents) {
      if (event.id) {
        await updateLifeEvent({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
        })
      }
    }
  }

  const handleCancelAll = () => {
    setIsEditingAll(false)
    setDrafts([])
  }

  const content = (
    <Container>
      <main className="flex-1 pb-10 w-full">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-500">
            Hi! This is @{username}
            <br />
            {isOwner ? (
              <BioInput bio={bio} onSubmit={onBioSubmit} />
            ) : (
              <span className="whitespace-pre-wrap">{bio}</span>
            )}
          </p>
        </div>
      </main>

      <main className="flex flex-col gap-8 w-full">
        {isOwner && lifeEvents.length > 0 && !isEditingAll && (
          <button
            type="button"
            onClick={handleEditAll}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors self-start"
          >
            edit
          </button>
        )}
        {lifeEvents.map((event, index) => (
          <LifeEventForm
            key={event.id ?? `${event.title}-${index}`}
            mode="editing"
            event={event}
            isEditing={isEditingAll}
            draft={drafts[index]}
            onDraftChange={(field, value) => handleDraftChange(index, field, value)}
          />
        ))}
        {isEditingAll && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-3 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelAll}
              className="px-3 py-1 text-xs font-medium rounded border border-stone-300 text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
          </div>
        )}
      </main>

      {isOwner && !isEditingAll && (
        <main className="w-full">
          {showNewEvent ? (
            <LifeEventForm
              mode="new"
              onSubmit={onLifeEventSubmit}
              onCancel={() => setShowNewEvent(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNewEvent(true)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              + Add event
            </button>
          )}
        </main>
      )}
    </Container>
  )

  if (isOwner) {
    return <Main username={username}>{content}</Main>
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 border-b border-stone-100">
        <a
          href="/login"
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          lifepo.st
        </a>
      </header>
      <main>{content}</main>
    </div>
  )
}
