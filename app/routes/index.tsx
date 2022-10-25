import { LoginButton } from "@/components/Header"
import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { getSessionData } from "@/lib/session.server"
import { Link } from "@remix-run/react"
import DarkModeToggler from "@/components/DarkModeToggler"

export async function loader({ request }: LoaderArgs) {
  const { token } = await getSessionData(request)
  if (token) {
    return redirect('/projects')
  }

  return null
}

export default function Index() {
  return (
    <div className="p-3 my-6 max-w-md mx-auto flex flex-col items-center justify-center relative">
      <div className="mb-6">
        <DarkModeToggler />
      </div>
      <p className="text-6xl">🐷</p>
      <h1 className="text-slate-500 dark:text-slate-300 font-medium text-2xl font-serif">
        <em>Press</em>unto
      </h1>
      <p className="text-lg my-6 text-center">
        Pressunto is a content editor for GitHub designed for managing markdown files in static websites.
      </p>
      <div>
        <p className="mt-6 mb-2 text-slate-500 dark:text-slate-300">
          Log in with GitHub
        </p>
        <LoginButton />
        <p className="text-sm my-6">
          By clicking login you allow this website to store a <strong>login cookie</strong> in your browser. Your login data will be used only to read the user name and profile picture, which organizations the user belongs to and to read and write code from the repositories (public or private). No other information will be accesed, such as issues, PRs, discussions, actions or other keys and settings.
          For more information on how data is accesed, you can check the{' '}
          <a className="underline" href="https://github.com/juandjara/pressunto/blob/master/app/lib/github.ts">public source code</a>{' '}
          or read <a className="underline" href='/privacy'>the privacy page</a>
        </p>
      </div>
      <footer className="-mx-2 mt-6 flex items-center gap-2 text-sm">
        <Link className="p-2 hover:underline" to='/doc'>Documentation</Link>
        <div className="h-6 border-r border-slate-300"></div>
        <Link className="p-2 hover:underline" to='/privacy'>Privacy</Link>
      </footer>
    </div>
  )
}
