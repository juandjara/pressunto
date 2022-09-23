import { Form, useFetcher, useLoaderData, useTransition } from "@remix-run/react"
import { json } from "@remix-run/node"
import type { LoaderFunction } from "@remix-run/node"
import { getSessionData } from "@/lib/session.server"

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSessionData(request)
  return json({ session })
}

export default function Index() {
  const loaderData = useLoaderData()
  const fetcher = useFetcher()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  return (
    <div className="container mx-auto px-2">
      <h1 className="my-4 text-center text-xl font-medium">
        Cachopo Master Sysyem - login
      </h1>
      <Form action='/oauth/login' method='post'>
        <button disabled={busy} className="disabled:opacity-50 flex rounded-lg text-white bg-slate-900 mx-auto px-4 py-2 mb-2">
          {busy ? 'Logging in...' : 'Log in with GitHub'}
        </button>
      </Form>
      <div>
        {loaderData?.session.token ? <p>TOKEN: {loaderData.session.token}</p> : null}
        {loaderData?.session.username ? <p>USER: {loaderData.session.username}</p> : null}
      </div>
      {loaderData?.session.token ? (
        <fetcher.Form action="/oauth/logout" method="post">
          <button disabled={busy} className="disabled:opacity-50 flex rounded-lg text-slate-600 hover:bg-slate-100 mx-auto px-4 py-2 mb-2">
            {busy ? 'Logging out...' : 'Logout'}
          </button> 
        </fetcher.Form>
      ) : null}
      <hr className="block my-4" />
      <button className="flex rounded-lg text-slate-600 hover:bg-slate-100 mx-auto px-4 py-2 mb-2">
        Continue in read-only mode
      </button>
    </div>
  )
}
