import ProjectSidebar from "@/components/ProjectSidebar"
import { getRepoFiles } from "@/lib/github"
import { getUserProjects } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { LoaderFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

export const loader: LoaderFunction = async ({ params, request }) => {
  const { org, repo } = params
  const { user } = await requireUserSession(request)

  // getUserProjects(user.name)
}

export default function ProjectDetails() {
  return (
    <div className="flex items-stretch">
      <ProjectSidebar collections={[]} />
      <Outlet />
    </div>
  )
}
