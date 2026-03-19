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
  isRegistered: boolean
}

export const Profile = ({
  initialProfile,
  username,
  avatarUrl,
  isRegistered,
}: ProfileProps) => {
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
        {initialProfile === null ? (
          <main className="flex-1 pb-10 w-full">
            <p className="text-sm text-stone-500">Profile not found!</p>
          </main>
        ) : (
          <>
            <main className="relative flex-1 pb-10 w-full">
              <div className="absolute right-full top-0 pr-6">
                <Avatar username={username} src={avatarUrl ?? undefined} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-stone-700">
                  @{username}
                </p>
                {bio && (
                  <p className="text-xs text-stone-500 whitespace-pre-wrap">
                    {bio}
                  </p>
                )}
                {!isRegistered && (
                  <p className="text-xs text-stone-400 mt-2">
                    Is this you?{" "}
                    <a href="/login" className="underline hover:text-stone-600">
                      Sign in to claim your profile
                    </a>
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
          </>
        )}
      </Container>
    </Main>
  )
}
