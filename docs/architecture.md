### Architecture and Call Flow

┌─────────┐
│ Client │
│ (Browser)│
└────┬─────┘
│
│ HTTP / Server Actions
▼
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE WORKER │
│ │
│ ROUTES SERVER ACTIONS │
│ ────── ────────────── │
│ GET /edit-profile ──┐ updateBio(bio) ─────────┐ │
│ GET /:username ─────┤ addLifeEvent(data) ─────┤ │
│ │ updateLifeEvent(data) ──┤ │
│ │ deleteLifeEvent(id) ────┤ │
│ ▼ │ │
│ loadProfile(handle) │ │
│ │ │ │
│ AUTH │ │ │
│ ──── │ │ │
│ POST /login/authorize ──────► AT Proto OAuth │ │
│ GET /oauth/callback ◄─────── AT Proto OAuth │ │
│ GET /logout ────────────────► AT Proto revoke │ │
└──────┬───────────────┬───────────────────────────┬───────┘ │
│ │ │ │
▼ ▼ ▼ │
┌─────────────┐ ┌───────────────────┐ ┌──────────────────┐ │
│ D1 Database │ │ Bluesky/PLC APIs │ │ User's PDS │◄─┘
│ │ │ (public, no auth)│ │ (authenticated) │
│ users table │ │ │ │ │
│ ─────────── │ │ resolveHandle │ │ putRecord │
│ did │ │ ───────────────► │ │ deleteRecord │
│ handle │ │ DID │ │ getRecord │
│ bsky_avatar │ │ │ │ listRecords │
│ \_url │ │ plc.directory │ │ │
│ │ │ ───────────────► │ │ Collections: │
│ │ │ PDS endpoint URL │ │ st.lifepo. │
│ │ │ │ │ profile │
│ │ │ getProfile │ │ st.lifepo. │
│ │ │ ───────────────► │ │ lifeEvent │
│ │ │ avatar URL │ │ │
└─────────────┘ └───────────────────┘ └──────────────────┘

Read flows (every page load):
GET /edit-profile
├─► Bluesky API: resolveHandle(handle) ──► DID
├─► PLC Directory: /{did} ──► PDS URL
├─► PDS: getRecord(profile) + listRecords(lifeEvents) ──► bio, events
└─► D1: SELECT bsky_avatar_url WHERE handle=? ──► avatar

GET /:username (same as above, but avatar has fallback)
├─► [same 3 PDS calls]
└─► D1: SELECT bsky_avatar_url WHERE handle=?
└─► [cache miss] ──► Bluesky API: getProfile ──► INSERT into D1

Write flows (user actions):
updateBio ──► KV: restore session ──► PDS: putRecord(profile)
addLifeEvent ──► KV: restore session ──► PDS: putRecord(lifeEvent)
updateLifeEvent ──► KV: restore session ──► PDS: putRecord(lifeEvent)
deleteLifeEvent ──► KV: restore session ──► PDS: deleteRecord(lifeEvent)

Auth flow:
Login: Client ──► Worker ──► AT Proto OAuth ──► callback
callback: exchange code + fetchBlueskyProfile ──► D1 upsert ──► set cookie

Logout: Client ──► Worker ──► AT Proto revoke ──► clear cookie
