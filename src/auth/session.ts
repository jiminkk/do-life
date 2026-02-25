const COOKIE_NAME = "session"

interface SessionData {
  did: string
  handle: string
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  )
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function fromBase64Url(str: string): string {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"))
}

export async function createSessionCookie(
  did: string,
  handle: string,
  secret: string,
): Promise<string> {
  const data = toBase64Url(JSON.stringify({ did, handle }))
  const sig = await hmacSign(data, secret)
  return `${COOKIE_NAME}=${data}.${sig}; HttpOnly; SameSite=Lax; Path=/; Secure; Max-Age=31536000`
}

export async function getSession(
  request: Request,
  secret: string,
): Promise<SessionData | null> {
  const cookieHeader = request.headers.get("Cookie")
  if (!cookieHeader) return null

  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  )
  if (!match) return null

  const value = match[1]
  const lastDot = value.lastIndexOf(".")
  if (lastDot === -1) return null

  const data = value.slice(0, lastDot)
  const sig = value.slice(lastDot + 1)
  const expectedSig = await hmacSign(data, secret)

  if (sig !== expectedSig) return null

  try {
    return JSON.parse(fromBase64Url(data)) as SessionData
  } catch {
    return null
  }
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Secure; Max-Age=0`
}
