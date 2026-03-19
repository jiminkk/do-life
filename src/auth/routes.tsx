import { env } from "cloudflare:workers"
import { RouteMiddleware } from "rwsdk/router"
import { createOAuthClient, getClientMetadata, getPublicJwk } from "./client"
import { createSessionCookie, clearSessionCookie, getSession } from "./session"
import { fetchBlueskyProfile, resolvePdsUrl } from "@/lib/bluesky"
import { upsertUser } from "@/lib/db"

export const loadSession =
  (): RouteMiddleware =>
  async ({ request, ctx }) => {
    if (import.meta.env.VITE_IS_DEV_SERVER) {
      ctx.isAuthenticated = true
      ctx.did = "did:plc:dev"
      ctx.username = "dev.bsky.social"
      return
    }
    const session = await getSession(request, env.SESSION_SECRET)
    if (session) {
      ctx.isAuthenticated = true
      ctx.did = session.did
      ctx.username = session.handle
    }
  }

export const requireAuth: RouteMiddleware = ({ ctx, request }) => {
  const { pathname } = new URL(request.url)
  // Only the dashboard requires authentication; profile pages are public
  const privatePaths = ["/", "/edit-profile"]
  if (!ctx.isAuthenticated && privatePaths.includes(pathname)) {
    return new Response(null, { status: 302, headers: { Location: "/login" } })
  }
  if (ctx.isAuthenticated && pathname === "/login") {
    return new Response(null, { status: 302, headers: { Location: "/" } })
  }
}

export const handleAuthorize: RouteMiddleware = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const formData = await request.formData()
  const handle = (formData.get("handle") as string | null)?.trim()

  if (!handle) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=missing_handle" },
    })
  }

  try {
    const client = await createOAuthClient(env)
    const url = await client.authorize(handle, {
      scope: "atproto transition:generic",
    })
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString() },
    })
  } catch (err) {
    console.error("OAuth authorize error:", err)
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=authorize_failed" },
    })
  }
}

export const handleCallback: RouteMiddleware = async ({ request }) => {
  const params = new URL(request.url).searchParams

  try {
    const client = await createOAuthClient(env)
    const { session } = await client.callback(params)
    const did = session.did

    // Fetch handle, avatar, and PDS URL
    const [bskyProfile, pdsUrl] = await Promise.all([
      fetchBlueskyProfile(did),
      resolvePdsUrl(did),
    ])

    if (bskyProfile === null) return

    const { handle, avatar } = bskyProfile

    // Persist user info in D1
    try {
      await upsertUser(env.DB, {
        did,
        handle,
        bskyAvatarUrl: avatar,
        pdsUrl,
        createdAt: new Date().toISOString(),
      })
    } catch {
      // Don't block sign-in if D1 write fails
    }

    const cookie = await createSessionCookie(did, handle, env.SESSION_SECRET)
    return new Response(null, {
      status: 302,
      headers: { Location: "/", "Set-Cookie": cookie },
    })
  } catch (err) {
    console.error("OAuth callback error:", err)
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=callback_failed" },
    })
  }
}

export const handleLogout: RouteMiddleware = async ({ request }) => {
  const session = await getSession(request, env.SESSION_SECRET)
  if (session?.did) {
    try {
      const client = await createOAuthClient(env)
      await client.revoke(session.did)
    } catch {
      // proceed with logout even if revocation fails
    }
  }
  return new Response(null, {
    status: 302,
    headers: { Location: "/login", "Set-Cookie": clearSessionCookie() },
  })
}

export const serveClientMetadata: RouteMiddleware = () => {
  return new Response(JSON.stringify(getClientMetadata(env)), {
    headers: { "Content-Type": "application/json" },
  })
}

export const serveJwks: RouteMiddleware = async () => {
  const publicJwk = await getPublicJwk(env)
  return new Response(JSON.stringify({ keys: [publicJwk] }), {
    headers: { "Content-Type": "application/json" },
  })
}
