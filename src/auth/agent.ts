import { env } from "cloudflare:workers"
import { Agent } from "@atproto/api"
import { createOAuthClient } from "./client"

export async function getAgent(did: string): Promise<Agent> {
  const client = await createOAuthClient(env)
  const session = await client.restore(did)
  return new Agent(session)
}
