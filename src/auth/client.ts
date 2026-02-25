import {
  WorkersOAuthClient,
  DidCacheKV,
  HandleCacheKV,
  StateStoreKV,
  SessionStoreKV,
} from "atproto-oauth-client-cloudflare-workers"
import { JoseKey } from "@atproto/jwk-jose"

function clientMetadata(env: Env) {
  const baseUrl = env.PUBLIC_URL.replace(/\/$/, "")
  return {
    client_id: `${baseUrl}/client-metadata.json`,
    client_name: "Do Life",
    client_uri: baseUrl,
    redirect_uris: [`${baseUrl}/oauth/callback`] as [
      string,
      ...string[],
    ],
    grant_types: ["authorization_code", "refresh_token"] as [
      "authorization_code",
      "refresh_token",
    ],
    scope: "atproto transition:generic",
    response_types: ["code"] as ["code"],
    application_type: "web" as const,
    token_endpoint_auth_method: "private_key_jwt" as const,
    token_endpoint_auth_signing_alg: "ES256" as const,
    dpop_bound_access_tokens: true,
    jwks_uri: `${baseUrl}/jwks.json`,
  }
}

function requirePrivateKeyJwk(env: Env): string {
  if (!env.PRIVATE_KEY_JWK) {
    throw new Error(
      "Missing PRIVATE_KEY_JWK env var. Define it as a Cloudflare Worker secret containing the JWK JSON.",
    )
  }
  return env.PRIVATE_KEY_JWK
}

export async function createOAuthClient(env: Env) {
  const keyset = await Promise.all([
    JoseKey.fromImportable(JSON.parse(requirePrivateKeyJwk(env)), "key-1"),
  ])

  return new WorkersOAuthClient({
    clientMetadata: clientMetadata(env),
    keyset,
    stateStore: new StateStoreKV(env.OAUTH_STATE_STORE),
    sessionStore: new SessionStoreKV(env.OAUTH_SESSION_STORE),
    didCache: new DidCacheKV(env.DID_CACHE),
    handleCache: new HandleCacheKV(env.HANDLE_CACHE, {}),
    fetch,
  })
}

export function getClientMetadata(env: Env) {
  return clientMetadata(env)
}

export async function getPublicJwk(env: Env) {
  const key = await JoseKey.fromImportable(
    JSON.parse(requirePrivateKeyJwk(env)),
    "key-1",
  )
  return key.publicJwk
}
