import { cleanRoute, getBasename, getDirname } from "@/lib/pathUtils"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderArgs} from "@remix-run/node"
import { redirect } from "@remix-run/node"

export async function loader({ params, request }: LoaderArgs) {
  const file = new URL(request.url).searchParams.get('file') || ''
  const folder = cleanRoute(getDirname(file))
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const config = await getProjectConfig(token, project)
  const collection = config.collections.find((c) => folder === cleanRoute(c.route))
  if (!collection) {
    return redirect(`/p/${project.id}/source/${file}`)
  }

  return redirect(`/p/${project.id}/${collection.id}/${getBasename(file)}`)
}