import { getOrgs } from "@/lib/github"
import { requireUserSession } from "@/lib/session.server"
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import useCurrentUser from "@/lib/useCurrentUser"

export async function loader({ request }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const orgs = await getOrgs(token)

  return json({ orgs })
}

export default function Search() {
  const user = useCurrentUser()
  const { orgs } = useLoaderData()

  return (
    <div className="px-2">
      <form className="mt-4">
        <label className="block mb-1 text-sm text-gray-600" htmlFor="org">Organizacion</label>
        <select name="org">
          <option value={user.name}>{user.name}</option>
          {orgs.map((o: string) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </form>
    </div>
  )
}