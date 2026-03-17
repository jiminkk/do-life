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
      const username = ctx.username ?? ""
      const profile = await loadProfile(username)
      return <EditProfile initialProfile={profile} username={username} />
    }),
    route("/:username", async ({ params }) => {
      const profileUsername = (params as { username: string }).username
      const profile = await loadProfile(profileUsername)
      return <Profile initialProfile={profile} username={profileUsername} />
    }),
  ]),
])
