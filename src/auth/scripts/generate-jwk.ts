// scripts/generate-jwk.ts
import { JoseKey } from "@atproto/jwk-jose"

async function main() {
  const key = await JoseKey.generate(["ES256"], "key-1")
  const jwk = key.jwk
  console.log(JSON.stringify(jwk))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
