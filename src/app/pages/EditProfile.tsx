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
import { updateBio, addLifeEvent, updateLifeEvent } from "@/app/actions/profile"
import { useState } from "react"

interface EditProfileProps {
  initialProfile: ProfileData | null
  username: string
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

const groupBySection = (
  events: LifeEvent[],
): { section: string; events: LifeEvent[]; indices: number[] }[] => {
  const groups: { section: string; events: LifeEvent[]; indices: number[] }[] =
    []
  events.forEach((event, i) => {
    const section = event.section ?? ""
    const existing = groups.find((g) => g.section === section)
    if (existing) {
      existing.events.push(event)
      existing.indices.push(i)
    } else {
      groups.push({ section, events: [event], indices: [i] })
    }
  })
  return groups
}

export const EditProfile = ({ initialProfile, username }: EditProfileProps) => {
  const [bio, setBio] = useState(initialProfile?.bio ?? "")
  const [showSaved, setShowSaved] = useState(false)

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

  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(initialEvents)
  const [drafts, setDrafts] = useState<DraftEvent[]>(() =>
    toDrafts(initialEvents),
  )
  // null = view mode; string = that section is being edited
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activeSectionName, setActiveSectionName] = useState("")
  // null = no new event form open; string = adding to that section
  const [addingToSection, setAddingToSection] = useState<string | null>(null)

  // New section creation state
  const [showNewSection, setShowNewSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [newSectionEvents, setNewSectionEvents] = useState<LifeEvent[]>([])
  const [newSectionError, setNewSectionError] = useState("")

  const now = new Date()
  const blankEventDraft = {
    title: "",
    description: "",
    startMonth: String(now.getMonth() + 1).padStart(2, "0"),
    startYear: String(now.getFullYear()),
    endMonth: "",
    endYear: "",
  }
  const [newEventDraft, setNewEventDraft] = useState(blankEventDraft)
  const [newEventFormKey, setNewEventFormKey] = useState(0)

  const onBioSubmit = async (data: { bio: string }) => {
    setBio(data.bio)
    await updateBio(data.bio)
  }

  // Used when adding an event to an existing section
  const onAddEventToSection = async (data: LifeEvent, section: string) => {
    setAddingToSection(null)
    const { id } = await addLifeEvent({
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      section: section || undefined,
    })
    const newEvent = { ...data, id, section: section || undefined }
    const updated = [...lifeEvents, newEvent]
    setLifeEvents(updated)
    setDrafts(toDrafts(updated))
  }

  const handleDraftChange = (index: number, field: string, value: string) => {
    setDrafts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value, dateError: "" }
      return next
    })
  }

  const handleSave = async (sectionIndices: number[]) => {
    let hasError = false
    const validated = [...drafts]
    sectionIndices.forEach((i) => {
      const draft = drafts[i]
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
      if (!sectionIndices.includes(i)) return event
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
        section: activeSectionName || undefined,
      }
    })

    setLifeEvents(updatedEvents)
    setDrafts(toDrafts(updatedEvents))
    setActiveSection(null)
    setAddingToSection(null)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)

    for (const i of sectionIndices) {
      const event = updatedEvents[i]
      if (event.id) {
        await updateLifeEvent({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          section: event.section,
        })
      }
    }
  }

  const handleCancel = () => {
    setDrafts(toDrafts(lifeEvents))
    setActiveSection(null)
    setAddingToSection(null)
  }

  const handleSaveNewSection = async () => {
    const allEvents = [...newSectionEvents]
    if (newEventDraft.title) {
      const startDate = `${newEventDraft.startYear}-${newEventDraft.startMonth}`
      const endDate =
        newEventDraft.endMonth && newEventDraft.endYear
          ? `${newEventDraft.endYear}-${newEventDraft.endMonth}`
          : undefined
      allEvents.push({
        title: newEventDraft.title,
        description: newEventDraft.description,
        startDate,
        endDate,
      })
    }

    if (!allEvents.some((e) => e.title)) {
      setNewSectionError("Add at least one event with a title")
      return
    }

    const persisted: LifeEvent[] = []
    for (const event of allEvents) {
      const { id } = await addLifeEvent({
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        section: newSectionName || undefined,
      })
      persisted.push({ ...event, id, section: newSectionName || undefined })
    }

    const updated = [...lifeEvents, ...persisted]
    setLifeEvents(updated)
    setDrafts(toDrafts(updated))
    setShowNewSection(false)
    setNewSectionName("")
    setNewSectionEvents([])
    setNewSectionError("")
    setNewEventDraft(blankEventDraft)
    setNewEventFormKey((k) => k + 1)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleCancelNewSection = () => {
    setShowNewSection(false)
    setNewSectionName("")
    setNewSectionEvents([])
    setNewSectionError("")
    setNewEventDraft(blankEventDraft)
    setNewEventFormKey((k) => k + 1)
  }

  const groups = groupBySection(lifeEvents)
  const isAnyActive = activeSection !== null

  return (
    <Main username={username}>
      <Container>
        <main className="flex-1 pb-10 w-full">
          <div className="relative">
            <div className="absolute right-full top-0 pr-6">
              <Avatar username={username} editable />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-stone-700">@{username}</p>
              <BioInput bio={bio} onSubmit={onBioSubmit} />
            </div>
          </div>
        </main>

        <main className="flex flex-col gap-10 w-full">
          {groups.map(({ section, events: groupEvents, indices }) => {
            const isEditingSection = activeSection === section
            return (
              <div
                key={section || "__unsectioned"}
                className="flex flex-col gap-10 group"
              >
                {/* Section heading — always in left column */}
                <div className="relative">
                  <div className="absolute right-full top-0 pr-6 flex items-center gap-2 whitespace-nowrap">
                    {!isEditingSection && !isAnyActive && !showNewSection && (
                      <button
                        type="button"
                        onClick={() => {
                          setDrafts(toDrafts(lifeEvents))
                          setActiveSection(section)
                          setActiveSectionName(section)
                        }}
                        className="text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                    {isEditingSection ? (
                      <input
                        type="text"
                        value={activeSectionName}
                        onChange={(e) => setActiveSectionName(e.target.value)}
                        placeholder="Section heading"
                        className="outline-none border-stone-300 focus:border-stone-500 bg-transparent text-sm font-medium text-stone-700 pb-0.5 transition-colors text-right"
                      />
                    ) : (
                      <p className="text-sm font-medium text-stone-700">
                        {section}
                      </p>
                    )}
                  </div>
                </div>

                {/* Events */}
                <div className="flex flex-col gap-8">
                  {groupEvents.map((event, gi) => {
                    const globalIndex = indices[gi]
                    return (
                      <LifeEventForm
                        key={event.id ?? `${event.title}-${globalIndex}`}
                        mode="editing"
                        event={event}
                        isEditing={isEditingSection}
                        draft={
                          isEditingSection ? drafts[globalIndex] : undefined
                        }
                        onDraftChange={
                          isEditingSection
                            ? (field, value) =>
                                handleDraftChange(globalIndex, field, value)
                            : undefined
                        }
                      />
                    )
                  })}
                </div>

                {isEditingSection && (
                  <>
                    {addingToSection === section ? (
                      <LifeEventForm
                        mode="new"
                        onSubmit={(data) =>
                          onAddEventToSection(data, activeSectionName)
                        }
                        onCancel={() => setAddingToSection(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingToSection(section)}
                        className="text-xs text-stone-400 hover:text-stone-600 transition-colors self-start"
                      >
                        + Add Event
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(indices)}
                        className="px-3 py-1 text-xs font-medium rounded bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1 text-xs font-medium rounded border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </main>

        <main className="w-full">
          {showNewSection ? (
            <div className="flex flex-col gap-6">
              {/* Section heading input — standalone, above events */}
              <input
                type="text"
                placeholder="Experience, projects"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                autoFocus
                className="outline-none border-b border-stone-300 focus:border-stone-500 bg-transparent text-sm font-medium text-stone-700 pb-0.5 transition-colors"
              />

              {/* Committed pending events */}
              {newSectionEvents.length > 0 && (
                <div className="flex flex-col gap-8">
                  {newSectionEvents.map((event, i) => (
                    <LifeEventForm
                      key={`pending-${i}`}
                      mode="editing"
                      event={event}
                      isEditing={false}
                    />
                  ))}
                </div>
              )}

              {/* Always-open event form — no per-event save/cancel */}
              <LifeEventForm
                key={newEventFormKey}
                mode="new"
                onSubmit={() => {}}
                onCancel={() => {}}
                onDataChange={setNewEventDraft}
              />

              {/* Add another event */}
              <button
                type="button"
                onClick={() => {
                  if (newEventDraft.title) {
                    const startDate = `${newEventDraft.startYear}-${newEventDraft.startMonth}`
                    const endDate =
                      newEventDraft.endMonth && newEventDraft.endYear
                        ? `${newEventDraft.endYear}-${newEventDraft.endMonth}`
                        : undefined
                    setNewSectionEvents((prev) => [
                      ...prev,
                      {
                        title: newEventDraft.title,
                        description: newEventDraft.description,
                        startDate,
                        endDate,
                        section: newSectionName || undefined,
                      },
                    ])
                    setNewEventDraft(blankEventDraft)
                    setNewEventFormKey((k) => k + 1)
                    setNewSectionError("")
                  }
                }}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors self-start"
              >
                + Add event
              </button>

              {newSectionError && (
                <p className="text-red-400 text-xs">{newSectionError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveNewSection}
                  className="px-3 py-1 text-xs font-medium rounded bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelNewSection}
                  className="px-3 py-1 text-xs font-medium rounded border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            !isAnyActive && (
              <button
                type="button"
                onClick={() => setShowNewSection(true)}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                + Add section
              </button>
            )
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
