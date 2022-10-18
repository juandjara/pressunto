import { searchRepos } from "@/lib/github"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

export async function loader({ request }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const url = new URL(request.url)
  const query = url.searchParams.get("q")
  if (!query) {
    return json([])
  }
  
  const { items } = await searchRepos(token, { query, includeForks: true })
  return json(items, {
    headers: {
      'Cache-control': 'max-age=30'
    }
  })
}