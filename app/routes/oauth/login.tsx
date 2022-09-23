import env from "@/lib/env.server"
import { redirect } from "@remix-run/node"

export async function action() {
  const params = new URLSearchParams({
    client_id: env.clientID,
    scope: 'public_repo',
    redirect_uri: 'http://localhost:3000/oauth/callback'
  })
  const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
  return redirect(oauthUrl)
}
