import { HEADER_HEIGHT } from "@/components/Header"
import ProjectSidebar from "@/components/ProjectSidebar"
import type { Project, ProjectConfig } from "@/lib/projects.server"
import { getProjectConfig } from "@/lib/projects.server"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

type LoaderData = {
  project: Project,
  config: ProjectConfig
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const repo = `${params.org}/${params.repo}`
  const { user, token } = await requireUserSession(request)

  const project = await getProject(user.name, repo)
  const config = await getProjectConfig(token, project)

  return json<LoaderData>({ project, config }, {
    headers: new Headers({
      'cache-control': 'max-age=60'
    })
  })
}

export const handle = {
  breadcrumb: ({ project }: LoaderData) => (
    <span className="text-slate-500 dark:text-slate-300 font-medium text-lg">
      {project.title}
    </span>
  )
}

export default function ProjectDetails() {
  return (
    <div className="md:flex items-stretch" style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}>
      <ProjectSidebar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  )
}
