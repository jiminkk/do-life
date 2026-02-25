import { render, route } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { About } from "@/app/pages/About"
import { DashboardPage } from "@/app/pages/Home"
import { LoginPage } from "@/app/pages/Login"
import { Profile } from "@/app/pages/Profile"
import {
  loadSession,
  requireAuth,
  handleAuthorize,
  handleCallback,
  handleLogout,
  serveClientMetadata,
  serveJwks,
} from "@/auth/routes"

export type AppContext = {
  isAuthenticated?: boolean
  did?: string
  username?: string
}

export default defineApp([
  setCommonHeaders(),
  loadSession(),

  // Static/API endpoints (no HTML rendering needed)
  route("/client-metadata.json", serveClientMetadata),
  route("/jwks.json", serveJwks),
  route("/oauth/callback", handleCallback),
  route("/logout", handleLogout),
  route("/login/authorize", handleAuthorize),

  // Auth gating: redirect unauthenticated users to /login, authenticated users away from /login
  requireAuth,

  // HTML pages
  render(Document, [
    route("/login", ({ request }) => {
      const error = new URL(request.url).searchParams.get("error")
      return <LoginPage error={error} />
    }),
    route("/", ({ ctx }) => <DashboardPage username={ctx.username ?? ""} />),
    route("/about", About),
    route("/profile", Profile),
  ]),
])
