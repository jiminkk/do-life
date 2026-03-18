import {
  Avatar,
  Container,
  LifeEventForm,
  LifeEvent,
  Main,
} from "@/app/ui-components"
import { ProfileData } from "@/app/types/types"

interface ProfileProps {
  initialProfile: ProfileData | null
  username: string
  avatarUrl: string | null
}

export const Profile = ({ initialProfile, username, avatarUrl }: ProfileProps) => {
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


  return (
    <Main>
      <Container>
        <main className="relative flex-1 pb-10 w-full">
          <div className="absolute right-full top-0 pr-6">
            <Avatar username={username} src={avatarUrl ?? undefined} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-stone-700">@{username}</p>
            {bio && (
              <p className="text-xs text-stone-500 whitespace-pre-wrap">
                {bio}
              </p>
            )}
          </div>
        </main>
        <main className="flex flex-col gap-10 w-full">
          <div className="flex flex-col gap-8">
            {lifeEvents.map((event, i) => (
              <LifeEventForm
                key={event.id ?? `${event.title}-${i}`}
                mode="editing"
                event={event}
                isEditing={false}
              />
            ))}
          </div>
        </main>
      </Container>
    </Main>
  )
}
