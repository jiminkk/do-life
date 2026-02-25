declare namespace Cloudflare {
  interface Env {
    DID_CACHE: KVNamespace
    HANDLE_CACHE: KVNamespace
    OAUTH_STATE_STORE: KVNamespace
    OAUTH_SESSION_STORE: KVNamespace
    PUBLIC_URL: string
    PRIVATE_KEY_JWK: string
    SESSION_SECRET: string
  }
}
