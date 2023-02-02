import { HEADER_HEIGHT } from "@/components/Header"
import ProjectSidebar from "@/components/ProjectSidebar"
import metaTitle from "@/lib/metaTitle"
import type { Project, ProjectConfig } from "@/lib/projects.server"
import { getProjectConfig } from "@/lib/projects.server"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderFunction, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

type LoaderData = {
  project: Project,
  config: ProjectConfig
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const config = await getProjectConfig(token, project)

  return json<LoaderData>({ project, config }, {
    headers: new Headers({
      'cache-control': 'max-age=60'
    })
  })
}

export const meta: MetaFunction<typeof loader> = ({ data, params, location }) => {
  const { project, config } = data as LoaderData
  const { cid, pid } = params

  if (location.pathname.endsWith('settings')) {
    return { title: metaTitle('Settings') }
  }
  if (location.pathname.includes('/source')) {
    return { title: metaTitle('Source Code') }
  }
  if (pid) {
    return { title: metaTitle(pid) }
  }
  if (cid) {
    return { title: metaTitle(config.collections.find((c) => c.id)?.name) }
  }
  return { title: metaTitle(project.title) }
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
    <div className="md:flex items-stretch" style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT})` }}>
      <ProjectSidebar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  )
}
