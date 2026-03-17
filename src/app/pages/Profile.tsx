import {
  Avatar,
  Container,
  LifeEventForm,
  LifeEvent,
} from "@/app/ui-components"
import { ProfileData } from "@/app/types/types"

interface ProfileProps {
  initialProfile: ProfileData | null
  username: string
}

const groupBySection = (
  events: LifeEvent[],
): { section: string; events: LifeEvent[] }[] => {
  const groups: { section: string; events: LifeEvent[] }[] = []
  events.forEach((event) => {
    const section = event.section ?? ""
    const existing = groups.find((g) => g.section === section)
    if (existing) {
      existing.events.push(event)
    } else {
      groups.push({ section, events: [event] })
    }
  })
  return groups
}

export const Profile = ({ initialProfile, username }: ProfileProps) => {
  const bio = initialProfile?.bio ?? ""
  const lifeEvents: LifeEvent[] = (initialProfile?.lifeEvents ?? []).map(
    (r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      startDate: r.startDate,
      endDate: r.endDate ?? undefined,
      section: r.section,
    }),
  )

  const groups = groupBySection(lifeEvents)

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
      <main>
        <Container>
          <main className="relative flex-1 pb-10 w-full">
            <div className="absolute right-full top-0 pr-6">
              <Avatar username={username} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-stone-700">@{username}</p>
              {bio && (
                <p className="text-sm text-stone-500 whitespace-pre-wrap">
                  {bio}
                </p>
              )}
            </div>
          </main>
          <main className="flex flex-col gap-10 w-full">
            {groups.map(({ section, events: groupEvents }) => (
              <div
                key={section || "__unsectioned"}
                className="flex flex-col gap-8"
              >
                {section && (
                  <div className="relative h-5">
                    <p className="absolute right-full top-0 pr-6 text-sm font-medium text-stone-700 whitespace-nowrap">
                      {section}
                    </p>
                  </div>
                )}
                {groupEvents.map((event, gi) => (
                  <LifeEventForm
                    key={event.id ?? `${event.title}-${gi}`}
                    mode="editing"
                    event={event}
                    isEditing={false}
                  />
                ))}
              </div>
            ))}
          </main>
        </Container>
      </main>
    </div>
  )
}
