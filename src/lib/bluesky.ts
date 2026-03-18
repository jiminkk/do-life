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
