export interface CachedUser {
  did: string
  bskyAvatarUrl: string | null
  pdsUrl: string | null
}

export async function upsertUser(
  db: D1Database,
  data: {
    did: string
    handle: string
    bskyAvatarUrl: string | null
    pdsUrl?: string | null
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (did, handle, bsky_avatar_url, pds_url) VALUES (?, ?, ?, ?)
       ON CONFLICT(did) DO UPDATE SET handle = excluded.handle, bsky_avatar_url = excluded.bsky_avatar_url, pds_url = COALESCE(excluded.pds_url, pds_url)`,
    )
    .bind(data.did, data.handle, data.bskyAvatarUrl, data.pdsUrl ?? null)
    .run()
}

export async function getUserByHandle(
  db: D1Database,
  handle: string,
): Promise<CachedUser | null> {
  return db
    .prepare(
      `SELECT did, bsky_avatar_url AS bskyAvatarUrl, pds_url AS pdsUrl FROM users WHERE handle = ?`,
    )
    .bind(handle)
    .first<CachedUser>()
}

export async function getOrFetchUser(
  db: D1Database,
  handle: string,
  fetchProfile: (actor: string) => Promise<{
    did: string
    handle: string
    avatar: string | null
  }>,
): Promise<CachedUser | null> {
  const row = await getUserByHandle(db, handle)
  if (row) return row

  // Not in DB — fetch from Bluesky and insert
  const profile = await fetchProfile(handle)
  await db
    .prepare(
      `INSERT INTO users (did, handle, bsky_avatar_url) VALUES (?, ?, ?)
       ON CONFLICT(did) DO UPDATE SET handle = excluded.handle, bsky_avatar_url = excluded.bsky_avatar_url`,
    )
    .bind(profile.did, profile.handle, profile.avatar)
    .run()
  return { did: profile.did, bskyAvatarUrl: profile.avatar, pdsUrl: null }
}
