"use client"

import {
  BioInput,
  Container,
  EditableLifeEvent,
  NewLifeEvent,
  LifeEvent,
  Main,
} from "@/app/ui-components"
import { ProfileData } from "@/app/types/types"
import { updateBio, addLifeEvent, updateLifeEvent } from "@/app/actions/profile"
import { useState } from "react"

interface ProfileProps {
  initialProfile: ProfileData | null
  username: string
}

export const Profile = ({ initialProfile, username }: ProfileProps) => {
  const [bio, setBio] = useState(initialProfile?.bio ?? "")
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(
    (initialProfile?.lifeEvents ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      startDate: new Date(r.startDate),
      endDate: r.endDate ? new Date(r.endDate) : undefined,
    })),
  )

  const onBioSubmit = async (data: { bio: string }) => {
    setBio(data.bio)
    await updateBio(data.bio)
  }

  const onLifeEventSubmit = async (data: LifeEvent) => {
    setShowNewEvent(false)
    const startDate = data.startDate.toISOString().split("T")[0]
    const endDate = data.endDate?.toISOString().split("T")[0]
    const { id } = await addLifeEvent({
      title: data.title,
      description: data.description,
      startDate,
      endDate,
    })
    setLifeEvents((prev) => [...prev, { ...data, id }])
  }

  const onLifeEventUpdate = async (index: number, updated: LifeEvent) => {
    setLifeEvents((prev) => {
      const next = [...prev]
      next[index] = updated
      return next
    })
    if (updated.id) {
      await updateLifeEvent({
        id: updated.id,
        title: updated.title,
        description: updated.description,
        startDate: updated.startDate.toISOString().split("T")[0],
        endDate: updated.endDate?.toISOString().split("T")[0],
      })
    }
  }

  return (
    <Main>
      <Container>
        <main className="flex-1 pb-10 w-full">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-500">
              Hi! This is @{username}
              <br />
              <BioInput bio={bio} onSubmit={onBioSubmit} />
            </p>
          </div>
        </main>

        <main className="flex flex-col gap-8 w-full">
          {lifeEvents.map((event, index) => (
            <EditableLifeEvent
              key={event.id ?? `${event.title}-${index}`}
              event={event}
              onUpdate={(updated) => onLifeEventUpdate(index, updated)}
            />
          ))}
        </main>

        <main className="w-full">
          {showNewEvent ? (
            <NewLifeEvent
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
      </Container>
    </Main>
  )
}
