import { getIdForRepo } from '@/lib/projects.server'
import { redirect, type LoaderArgs } from '@remix-run/node'

export async function loader({ request }: LoaderArgs) {
  const params = new URL(request.url).searchParams
  const repo = params.get('repo')
  const file = params.get('file')

  if (!repo || !file) {
    return new Response('"repo" and "file" params are mandatory in query string', { status: 400 })
  }

  const projectId = await getIdForRepo(repo)
  if (!projectId) {
    return redirect(`/projects/new?repo=${repo}&file=${file}`)
  }

  return redirect(`/p/${projectId}/edit?file=${file}`)
}