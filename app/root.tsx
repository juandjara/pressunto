import type { LoaderFunction, MetaFunction } from "@remix-run/node"
import { json } from '@remix-run/node'
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react"
import GlobalSpinner from "./components/GlobalSpiner"
import Header from "./components/Header"
import { getSessionData } from "./lib/session.server"
import LiveReload from "./LiveReload"
import tailwind from "./tailwind.css"
import animate from './animate.css'

export function links() {
  return [
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: animate },
  ]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: '🐷 Pressunto',
  viewport: "width=device-width,initial-scale=1",
})

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await getSessionData(request)
  return json({ user })
}

export default function App() {
  const { user } = useLoaderData()
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="dark:text-slate-100 dark:bg-slate-800 text-slate-700">
        <GlobalSpinner />
        <div className="container mx-auto">
          <Header user={user} />
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="max-w-xl bg-red-50 text-red-800 rounded-xl my-8 mx-auto p-4">
          <h1 className="text-2xl font-bold text-red-600">Oops :c</h1>
          <h2 className="mt-1 text-xl font-bold text-red-600">There was an unexpected error</h2>
          <p className="my-2 text-lg">{error.message}</p>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const { status, statusText, data } = useCatch()
  const title = `${status} ${statusText}`

  return (
    <html>
      <head>
        <title>{'Oops! · ' + title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="h-screen flex flex-col items-center justify-center text-slate-700 text-center">
          <p className="grayscale text-7xl text-center">🐷</p>
          <p className="text-lg">
            {status === 404 ? 'No piggy here' : 'Sad piggy'}
          </p>
          <div className="my-6">
            <p className="text-xl font-semibold">{title}</p>
            <p className="text-base">{data?.message}</p>
          </div>
          <Link to="/" className="bg-slate-700 text-white rounded-lg px-4 py-2">Take me home</Link>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
