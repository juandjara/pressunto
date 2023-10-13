import { searchRepos } from "@/lib/github.search"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

export async function loader({ request }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''
  const org = url.searchParams.get('org') as string
  
  const { items } = await searchRepos(token, { query, org, includeForks: true })
  return json(items, {
    headers: {
      'Cache-control': 'max-age=30'
    }
  })
}
