import { LoginButton } from "@/components/Header"
import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { getSessionData } from "@/lib/session.server"

export async function loader({ request }: LoaderArgs) {
  const { token } = await getSessionData(request)
  if (token) {
    return redirect('/search')
  }

  return null
}

export default function Index() {
  return (
    <div className="my-6 max-w-md mx-auto flex flex-col items-center justify-center">
      <p className="text-6xl">🐷</p>
      <h1 className="text-slate-500 font-medium text-2xl font-serif">
        <em>Press</em>unto
      </h1>
      <p className="text-lg my-6 text-center">
        Pressunto is a content editor for GitHub designed for managing websites.
      </p>
      <LoginButton />
    </div>
  )
}
