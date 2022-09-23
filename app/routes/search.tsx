import { json } from "@remix-run/node"
import type { LoaderArgs } from '@remix-run/node'
import { useLoaderData } from "@remix-run/react"
import { getSessionData } from "@/lib/session.server"

export async function loader({ request }: LoaderArgs) {
  const session = await getSessionData(request)
  return json({ ...session })
}

export default function Search() {
  const data = useLoaderData()
  console.log('search data', data)

  return (
    <div className="container mx-auto px-2">
      <h1 className="my-4 text-center text-xl font-medium">
        Repo Search
      </h1>
    </div>
  )
}