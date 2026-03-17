# RedwoodSDK Minimal Starter

This is the starter project for RedwoodSDK. It's a template designed to get you up and running as quickly as possible.

Create your new project:

```shell
npx create-rwsdk my-project-name
cd my-project-name
npm install
```

## Running the dev server

```shell
npm run dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You should see a "Hello World" message in your browser.

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)

---

## Architecture & State Flow

```mermaid
flowchart TB
    subgraph Browser["Browser"]
        UI["React UI\n(client components)"]
        Cookie["Session Cookie\nHMAC-SHA256 signed\ndid + handle"]
    end

    subgraph Worker["Cloudflare Worker  ·  lifepo.st"]
        direction TB
        MW["loadSession() middleware\nverify cookie → ctx.did, ctx.username"]
        Auth["requireAuth middleware\nredirect /login if private path"]
        Pages["RSC Pages\nProfile · EditProfile · Dashboard"]
        Actions["Server Actions\nloadProfile · updateBio\naddLifeEvent · updateLifeEvent"]
        KV[("Cloudflare KV\n─────────────\nOAUTH_STATE_STORE\nOAUTH_SESSION_STORE\nDID_CACHE\nHANDLE_CACHE")]
        OAuthClient["OAuth Client\natproto-oauth-client\n─────────────\nclient.authorize()\nclient.callback()\nclient.revoke()"]
    end

    subgraph ATProto["ATProto Network"]
        direction TB
        BskyOAuth["Bluesky OAuth\nbsky.social\n/oauth/authorize"]
        BskyAPI["Bluesky Public API\npublic.api.bsky.app\ngetProfile (DID → handle)"]
        PLC["PLC Directory\nplc.directory\nDID → PDS URL"]
        PDS["Personal Data Server\nst.lifepo.profile\nst.lifepo.lifeEvent\n(putRecord / listRecords)"]
    end

    %% ── Login flow ──────────────────────────────────────────
    UI -->|"POST /login/authorize\n{handle}"| OAuthClient
    OAuthClient <-->|"store OAuth state"| KV
    OAuthClient -->|"redirect to"| BskyOAuth
    BskyOAuth -->|"redirect /oauth/callback\n?code=…&state=…"| OAuthClient
    OAuthClient <-->|"retrieve OAuth state\nstore OAuth session"| KV
    OAuthClient -->|"resolve DID → handle"| BskyAPI
    OAuthClient -->|"Set-Cookie session=…\nredirect /"| Cookie

    %% ── Every request ───────────────────────────────────────
    Cookie -->|"Cookie header"| MW
    MW --> Auth
    Auth --> Pages

    %% ── Profile read ────────────────────────────────────────
    Pages -->|"loadProfile(username)"| Actions
    Actions -->|"resolveHandle"| BskyOAuth
    Actions -->|"DID doc lookup"| PLC
    PLC -->|"PDS endpoint URL"| Actions
    Actions -->|"getRecord / listRecords"| PDS
    PDS -->|"bio + lifeEvents"| Pages
    Pages -->|"SSR HTML"| UI

    %% ── Profile write ───────────────────────────────────────
    UI -->|"server action\n{bio / event data}"| Actions
    Actions -->|"getAgent(ctx.did)\nagent.putRecord"| PDS
```

### Flow summary

| Flow | Path |
|---|---|
| **Login** | Browser → `POST /login/authorize` → OAuth client → Bluesky OAuth → `/oauth/callback` → signed session cookie |
| **Every request** | Cookie → `loadSession()` verifies HMAC → populates `ctx.did` + `ctx.username` → `requireAuth` gates private routes |
| **Profile read** | `loadProfile()` → resolve handle → PLC directory → PDS `listRecords` → SSR into HTML |
| **Profile write** | Client fires server action → `agent.putRecord` → PDS stores Lexicon record |
| **KV** | OAuth state & sessions survive the authorize→callback redirect; DID/handle caches reduce repeated lookups |
