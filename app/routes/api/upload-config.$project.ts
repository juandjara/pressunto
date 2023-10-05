import { getProject, getProjectConfig } from '@/lib/projects.server'
import { requireUserSession } from '@/lib/session.server'
import type { LoaderArgs} from '@remix-run/node'
import { json } from '@remix-run/node'

export async function loader({ params, request }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const conf = await getProjectConfig(token, project)

  return json({
    token,
    repo: project.repo,
    branch: project.branch,
    folder: conf.mediaFolder === '/' ? '' : conf.mediaFolder,
  })
}
