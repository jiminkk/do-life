"use client"

import {
  BioInput,
  Container,
  EditableLifeEvent,
  LifeEventInput,
  LifeEvent,
  Main,
} from "@/app/ui-components"
import { useState } from "react"

export const Profile = () => {
  const [username, setUsername] = useState("jasmine")
  const [bio, setBio] = useState("hey doods")

  const initialLifeEvents = [
    {
      title: "Amazon Music",
      description:
        "I worked on the Amazon Music team as a software engineer. blahb labh blah",
      startDate: new Date("2017-08-13"),
      endDate: new Date("2022-02-02"),
    },
  ]
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(initialLifeEvents)

  const [showEventInput, setShowEventInput] = useState(false)

  const onLifeEventSubmit = (data: LifeEvent) => {
    console.log(data)
    setLifeEvents([...lifeEvents, data])
  }

  const onBioSubmit = (data: { bio: string }) => {
    console.log(data)
    setBio(data.bio)
  }

  const onLifeEventUpdate = (index: number, updated: LifeEvent) => {
    const newEvents = [...lifeEvents]
    newEvents[index] = updated
    setLifeEvents(newEvents)
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
              key={`${event.title}-${index}`}
              event={event}
              onUpdate={(updated) => onLifeEventUpdate(index, updated)}
            />
          ))}
        </main>

        <main className="w-full">
          <button
            className="text-xs"
            onClick={() => {
              console.log("hello")
              setShowEventInput(true)
            }}
          >
            Enter a Life event..
          </button>
          <LifeEventInput onSubmit={onLifeEventSubmit} />
        </main>
      </Container>
    </Main>
  )
}
