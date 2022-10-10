import { useMatches } from "@remix-run/react"
import type { ProjectConfig } from "./projects.server"

const PARENT_ROUTE_ID = "routes/projects/$org.$repo"

export default function useProjectConfig() {
  const match = useMatches().find(r => r.id === PARENT_ROUTE_ID)
  return match?.data.config as ProjectConfig
}
