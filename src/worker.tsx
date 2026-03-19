import { render, route } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { About } from "@/app/pages/About"
import { DashboardPage } from "@/app/pages/Home"
import { LoginPage } from "@/app/pages/Login"
import { Profile } from "@/app/pages/Profile"
import { EditProfile } from "@/app/pages/EditProfile"
import {
  loadSession,
  requireAuth,
  handleAuthorize,
  handleCallback,
  handleLogout,
  serveClientMetadata,
  serveJwks,
} from "@/auth/routes"
import { loadProfile } from "@/app/actions/profile"
import { getUserByHandle, getOrFetchUser } from "@/lib/db"
import { fetchBlueskyProfile } from "@/lib/bluesky"
import { env } from "cloudflare:workers"

export type AppContext = {
  isAuthenticated?: boolean
  did?: string
  username?: string
}

export default defineApp([
  setCommonHeaders(),
  loadSession(),

  // OAuth endpoints
  route("/client-metadata.json", serveClientMetadata),
  route("/jwks.json", serveJwks),
  route("/oauth/callback", handleCallback),
  route("/logout", handleLogout),
  route("/login/authorize", handleAuthorize),

  // Auth gating
  requireAuth,

  // Pages
  render(Document, [
    route("/login", ({ request }) => {
      const error = new URL(request.url).searchParams.get("error")
      return <LoginPage error={error} />
    }),
    route("/", ({ ctx }) => <DashboardPage username={ctx.username ?? ""} />),
    route("/about", About),
    route("/edit-profile", async ({ ctx }) => {
      const username = ctx.username
      if (username == null) {
        return new Response(null, { status: 404 })
      }

      const cached = await getUserByHandle(env.DB, username)
      const profile = await loadProfile(username, cached)
      return (
        <EditProfile
          initialProfile={profile}
          username={username}
          avatarUrl={cached?.bskyAvatarUrl ?? null}
        />
      )
    }),
    route("/favicon.ico", () => new Response(null, { status: 404 })),
    route("/:username", async ({ params }) => {
      const profileUsername = (params as { username: string }).username
      const cached = await getOrFetchUser(
        env.DB,
        profileUsername,
        fetchBlueskyProfile,
      )
      if (cached == null) {
        return new Response(null, { status: 404 })
      }

      const profile = await loadProfile(profileUsername, cached)

      const isRegistered = cached.createdAt != null
      return (
        <Profile
          initialProfile={profile}
          username={profileUsername}
          avatarUrl={cached.bskyAvatarUrl ?? null}
          isRegistered={isRegistered}
        />
      )
    }),
  ]),
])
