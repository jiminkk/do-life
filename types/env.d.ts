declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    DID_CACHE: KVNamespace
    HANDLE_CACHE: KVNamespace
    OAUTH_STATE_STORE: KVNamespace
    OAUTH_SESSION_STORE: KVNamespace
    PROFILE_DATA: KVNamespace
    PUBLIC_URL: string
    PRIVATE_KEY_JWK: string
    SESSION_SECRET: string
  }
}
