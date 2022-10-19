import { useMatches } from "@remix-run/react"
import type { Project, ProjectConfig } from "./projects.server"

const PARENT_ROUTE_ID = "routes/projects/$org.$repo"

export default function useProjectConfig() {
  const match = useMatches().find(r => r.id === PARENT_ROUTE_ID)
  return match?.data.config as ProjectConfig
}

export function useProject() {
  const match = useMatches().find(r => r.id === PARENT_ROUTE_ID)
  return match?.data.project as Project
}
