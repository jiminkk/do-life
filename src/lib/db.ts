export async function upsertUser(
  db: D1Database,
  data: { did: string; handle: string; bskyAvatarUrl: string | null },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (did, handle, bsky_avatar_url) VALUES (?, ?, ?)
       ON CONFLICT(did) DO UPDATE SET handle = excluded.handle, bsky_avatar_url = excluded.bsky_avatar_url`,
    )
    .bind(data.did, data.handle, data.bskyAvatarUrl)
    .run()
}

export async function getAvatarUrlByHandle(
  db: D1Database,
  handle: string,
): Promise<string | null> {
  const row = await db
    .prepare(
      `SELECT avatar_url, bsky_avatar_url FROM users WHERE handle = ?`,
    )
    .bind(handle)
    .first<{ avatar_url: string | null; bsky_avatar_url: string | null }>()
  return row?.avatar_url ?? row?.bsky_avatar_url ?? null
}

export async function getOrFetchAvatarUrl(
  db: D1Database,
  handle: string,
  fetchProfile: (actor: string) => Promise<{
    did: string
    handle: string
    avatar: string | null
  }>,
): Promise<string | null> {
  // Check DB first
  const row = await db
    .prepare(
      `SELECT avatar_url, bsky_avatar_url FROM users WHERE handle = ?`,
    )
    .bind(handle)
    .first<{ avatar_url: string | null; bsky_avatar_url: string | null }>()

  if (row) {
    return row.avatar_url ?? row.bsky_avatar_url ?? null
  }

  // Not in DB — fetch from Bluesky and insert
  const profile = await fetchProfile(handle)
  if (profile.avatar) {
    await db
      .prepare(
        `INSERT INTO users (did, handle, bsky_avatar_url) VALUES (?, ?, ?)
         ON CONFLICT(did) DO UPDATE SET handle = excluded.handle, bsky_avatar_url = excluded.bsky_avatar_url`,
      )
      .bind(profile.did, profile.handle, profile.avatar)
      .run()
  }
  return profile.avatar
}

export async function updateAvatarUrl(
  db: D1Database,
  did: string,
  avatarUrl: string,
): Promise<void> {
  await db
    .prepare(`UPDATE users SET avatar_url = ? WHERE did = ?`)
    .bind(avatarUrl, did)
    .run()
}
