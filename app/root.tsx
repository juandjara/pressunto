import type { ActionArgs, LoaderFunction, MetaFunction } from "@remix-run/node"
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
import { getFlashMessage, getSessionData } from "./lib/session.server"
import LiveReload from "./components/LiveReload"
import tailwind from "./tailwind.css"
import metaTitle from "./lib/metaTitle"
import { getTheme, toggleTheme } from "./lib/themeCookie.server"
import FlashMessage from "./components/FlashMessage"

export function links() {
  return [
    { rel: "stylesheet", href: tailwind },
    { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ]
}

const description = 'Pressunto is a content editor for GitHub that does not get in your way designed for managing markdown files in static websites. It aims the simplest editing experience you could hope for while preserving your original content structure.'
const image = 'https://pressunto.fly.dev/screenshot.png'
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
  title: metaTitle(''),
  'og:title': metaTitle(''),
  description,
  'og:description': description,
  'twitter:card': 'summary_large_iamge',
  'twitter:domain': 'pressunto.fly.dev',
  'twitter:title': metaTitle(''),
  'twitter:description': description,
  'twitter:image': image,
  'og:image': image,
  'og:image:alt': 'Screenshot of the Post Editor of the platform',
  'og:image:width': '2658',
  'og:image:height': '1664',
  'og:site_name': metaTitle('')
})

export const loader: LoaderFunction = async ({ request }) => {
  const [{ user }, theme, { newCookie, flashMessage }] = await Promise.all([
    getSessionData(request),
    getTheme(request),
    getFlashMessage(request)
  ])

  return json({ user, theme, flashMessage }, {
    headers: {
      'Set-Cookie': newCookie
    }
  })
}

export async function action({ request }: ActionArgs) {
  const cookie = await toggleTheme(request)
  return json({ ok: true }, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function App() {
  const { user, theme } = useLoaderData()
  return (
    <html lang="en" className={theme}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="dark:text-slate-100 dark:bg-slate-900 text-slate-700">
        <GlobalSpinner />
        <div className="lg:container mx-auto min-h-screen relative">
          <FlashMessage />
          <Header user={user} />
          <div className="bg-slate-50 dark:bg-slate-800 rounded-md shadow mb-2">
            <Outlet />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script async defer data-website-id="3dbc951d-9c5b-4b25-8c24-1150c74db48f" src="https://uma.djara.dev/umami.js"></script>
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
  const message = typeof data === 'string' ? data : data?.message

  return (
    <html>
      <head>
        <title>{'Oops! · ' + title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-slate-700 text-center">
          <p className="grayscale text-7xl text-center">🐷</p>
          <div className="my-6">
            <p className="text-xl font-semibold">{title}</p>
            <p className="text-base">{message}</p>
          </div>
          <Link to="/" className="bg-slate-700 text-white rounded-lg px-4 py-2">Take me home</Link>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
