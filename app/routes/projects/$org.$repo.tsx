import ProjectSidebar from "@/components/ProjectSidebar"
import type { Project, ProjectConfig } from "@/lib/projects.server"
import { getProjectConfig } from "@/lib/projects.server"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

type LoaderData = {
  project: Project,
  config: ProjectConfig
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const repo = `${params.org}/${params.repo}`
  const { user, token } = await requireUserSession(request)

  const project = await getProject(user.name, repo)
  const config = await getProjectConfig(token, project)

  return json<LoaderData>({ project, config })
}

export default function ProjectDetails() {
  const { project, config } = useLoaderData<LoaderData>()

  return (
    <div className="flex items-stretch">
      <ProjectSidebar collections={config.collections} />
      <Outlet />
    </div>
  )
}
