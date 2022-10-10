import ProjectSidebar from "@/components/ProjectSidebar"
import { Outlet } from "@remix-run/react"

export default function ProjectDetails() {
  return (
    <div className="flex items-stretch">
      <ProjectSidebar collections={[]} />
      <Outlet />
    </div>
  )
}
