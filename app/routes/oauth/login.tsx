import env from "@/lib/env.server"
import type { ActionArgs} from "@remix-run/node"
import { redirect } from "@remix-run/node"

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const params = new URLSearchParams({
    client_id: env.clientID,
    scope: `read:org ${formData.get('scope') as string || 'public_repo'}`
  })
  const ru = process.env.REDIRECT_URI || 'http://localhost:3000/oauth/callback'
  const oauthUrl = `https://github.com/login/oauth/authorize?${params.toString()}&redirect_uri=${ru}`
  return redirect(oauthUrl)
}
