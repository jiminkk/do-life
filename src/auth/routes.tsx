import { env } from "cloudflare:workers"
import { RouteMiddleware } from "rwsdk/router"
import { createOAuthClient, getClientMetadata, getPublicJwk } from "./client"
import { createSessionCookie, clearSessionCookie, getSession } from "./session"

export const loadSession =
  (): RouteMiddleware =>
  async ({ request, ctx }) => {
    const session = await getSession(request, env.SESSION_SECRET)
    if (session) {
      ctx.isAuthenticated = true
      ctx.did = session.did
      ctx.username = session.handle
    }
  }

export const requireAuth: RouteMiddleware = ({ ctx, request }) => {
  const { pathname } = new URL(request.url)
  const publicPaths = ["/login", "/about"]
  if (!ctx.isAuthenticated && !publicPaths.includes(pathname)) {
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

    // Fetch handle from the Bluesky public API
    let handle: string = did
    try {
      const resp = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
      )
      if (resp.ok) {
        const profile = (await resp.json()) as { handle: string }
        handle = profile.handle
      }
    } catch {
      // Fall back to the DID if handle fetch fails
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

export const handleLogout: RouteMiddleware = () => {
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
