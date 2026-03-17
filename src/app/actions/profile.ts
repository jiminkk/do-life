"use server"

import { requestInfo } from "rwsdk/worker"
import { Agent } from "@atproto/api"
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

export async function loadProfile(username: string): Promise<ProfileData | null> {
  if (import.meta.env.VITE_IS_DEV_SERVER) return null
  try {
    // Resolve handle → DID
    const resolveResp = await fetch(
      `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(username)}`,
    )
    if (!resolveResp.ok) return null
    const { did } = (await resolveResp.json()) as { did: string }

    // Resolve DID → PDS URL
    const didDocResp = await fetch(`https://plc.directory/${did}`)
    if (!didDocResp.ok) return null
    const didDoc = (await didDocResp.json()) as {
      service?: Array<{ id: string; serviceEndpoint: string }>
    }
    const pdsUrl = didDoc.service?.find((s) => s.id === "#atproto_pds")?.serviceEndpoint
    if (!pdsUrl) return null

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
