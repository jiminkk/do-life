export async function resolvePdsUrl(
  did: string,
): Promise<string | null> {
  const resp = await fetch(`https://plc.directory/${did}`)
  if (!resp.ok) return null
  const didDoc = (await resp.json()) as {
    service?: Array<{ id: string; serviceEndpoint: string }>
  }
  return (
    didDoc.service?.find((s) => s.id === "#atproto_pds")?.serviceEndpoint ??
    null
  )
}

export async function fetchBlueskyProfile(
  actor: string,
): Promise<{ did: string; handle: string; avatar: string | null }> {
  const resp = await fetch(
    `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`,
  )
  if (!resp.ok) {
    return { did: actor, handle: actor, avatar: null }
  }
  const profile = (await resp.json()) as {
    did: string
    handle: string
    avatar?: string
  }
  return {
    did: profile.did,
    handle: profile.handle,
    avatar: profile.avatar ?? null,
  }
}
