"use server"

import { requestInfo } from "rwsdk/worker"
import { getAgent } from "@/auth/agent"
import { ProfileData } from "@/app/types/types"

const LIFE_EVENT_COLLECTION = "st.lifepo.lifeEvent"
const PROFILE_COLLECTION = "st.lifepo.profile"

export async function updateBio(bio: string): Promise<void> {
  const { ctx } = requestInfo
  if (!ctx.isAuthenticated || !ctx.did) throw new Error("AuthRequired")
  if (import.meta.env.VITE_IS_DEV_SERVER) return

  const agent = await getAgent(ctx.did)
  await agent.com.atproto.repo.putRecord({
    repo: ctx.did,
    collection: PROFILE_COLLECTION,
    rkey: "self",
    record: { $type: PROFILE_COLLECTION, bio },
  })
}

export async function addLifeEvent(data: {
  title: string
  description?: string
  startDate: string
  endDate?: string
}): Promise<{ id: string }> {
  const { ctx } = requestInfo
  if (!ctx.isAuthenticated || !ctx.did) throw new Error("AuthRequired")

  if (import.meta.env.VITE_IS_DEV_SERVER) {
    return { id: Date.now().toString() }
  }

  const agent = await getAgent(ctx.did)
  const rkey = Date.now().toString()
  await agent.com.atproto.repo.putRecord({
    repo: ctx.did,
    collection: LIFE_EVENT_COLLECTION,
    rkey,
    record: {
      $type: LIFE_EVENT_COLLECTION,
      title: data.title,
      description: data.description ?? "",
      startDate: data.startDate,
      endDate: data.endDate,
    },
  })
  return { id: rkey }
}

export async function updateLifeEvent(data: {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
}): Promise<void> {
  const { ctx } = requestInfo
  if (!ctx.isAuthenticated || !ctx.did) throw new Error("AuthRequired")
  if (import.meta.env.VITE_IS_DEV_SERVER) return

  const agent = await getAgent(ctx.did)
  await agent.com.atproto.repo.putRecord({
    repo: ctx.did,
    collection: LIFE_EVENT_COLLECTION,
    rkey: data.id,
    record: {
      $type: LIFE_EVENT_COLLECTION,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  })
}

export async function loadProfile(
  did: string,
  username: string,
): Promise<ProfileData | null> {
  if (import.meta.env.VITE_IS_DEV_SERVER) return null
  try {
    const agent = await getAgent(did)
    const [profileResp, eventsResp] = await Promise.all([
      agent.com.atproto.repo
        .getRecord({ repo: did, collection: PROFILE_COLLECTION, rkey: "self" })
        .catch(() => null),
      agent.com.atproto.repo
        .listRecords({ repo: did, collection: LIFE_EVENT_COLLECTION })
        .catch(() => null),
    ])
    const bio = (profileResp?.data.value as { bio?: string } | null)?.bio ?? ""
    const lifeEvents = (eventsResp?.data.records ?? []).map((r) => {
      const v = r.value as {
        title: string
        description?: string
        startDate: string
        endDate?: string
      }
      return {
        id: r.uri.split("/").pop()!,
        title: v.title,
        description: v.description,
        startDate: v.startDate,
        endDate: v.endDate,
      }
    })
    return { handle: username, bio, lifeEvents }
  } catch {
    return null
  }
}
