"use server"

import { requestInfo } from "rwsdk/worker"
import { Agent } from "@atproto/api"
import { getAgent } from "@/auth/agent"
import { ProfileData } from "@/app/types/types"
import { resolvePdsUrl } from "@/lib/bluesky"

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
  section?: string
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
      section: data.section,
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
  section?: string
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
      section: data.section,
    },
  })
}

export async function deleteLifeEvent(id: string): Promise<void> {
  const { ctx } = requestInfo
  if (!ctx.isAuthenticated || !ctx.did) throw new Error("AuthRequired")
  if (import.meta.env.VITE_IS_DEV_SERVER) return

  const agent = await getAgent(ctx.did)
  await agent.com.atproto.repo.deleteRecord({
    repo: ctx.did,
    collection: LIFE_EVENT_COLLECTION,
    rkey: id,
  })
}

export async function loadProfile(
  username: string,
  cached?: { did: string; pdsUrl: string | null } | null,
): Promise<ProfileData | null> {
  if (import.meta.env.VITE_IS_DEV_SERVER) return null
  try {
    let did: string
    let pdsUrl: string | null

    if (cached?.did) {
      did = cached.did
      pdsUrl = cached.pdsUrl ?? null
    } else {
      // Resolve handle → DID (uncached path)
      const resolveResp = await fetch(
        `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(username)}`,
      )
      if (!resolveResp.ok) return null
      ;({ did } = (await resolveResp.json()) as { did: string })
      pdsUrl = null
    }

    // Resolve DID → PDS URL if not cached
    if (!pdsUrl) {
      pdsUrl = await resolvePdsUrl(did)
      if (!pdsUrl) return null
    }

    // Fetch records from PDS (public reads, no auth needed)
    const agent = new Agent(pdsUrl)
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
        section?: string
      }
      return {
        id: r.uri.split("/").pop()!,
        title: v.title,
        description: v.description,
        startDate: v.startDate,
        endDate: v.endDate,
        section: v.section,
      }
    })
    return { handle: username, bio, lifeEvents }
  } catch {
    return null
  }
}
