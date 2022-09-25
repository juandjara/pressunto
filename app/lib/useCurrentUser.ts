import { useMatches } from "@remix-run/react"
import type { User } from "./github"

/** retrieve already loaded user data from root loader */
export default function useCurrentUser() {
  const rootData = useMatches()[0].data as { user: User }
  return rootData.user
}