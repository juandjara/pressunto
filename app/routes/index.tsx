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
        Pressunto is a content editor for GitHub that <strong>does not get in your way</strong>, designed for managing <strong>markdown</strong> files in static websites. 
        <br /><br />
        It aims to be the <strong>simplest</strong> editing experience you could hope for, preserving the original structure of your content, so you can <strong>own your data</strong>.
      </p>
      <div>
        <p className="mt-6 mb-2 text-slate-500 dark:text-slate-300">
          Log in with GitHub
        </p>
        <LoginButton />
        <p className="text-sm my-6">
          By loging in you allow this website to store a <strong>login cookie</strong> in your browser.
          For more information on how data is accesed, you can read the <a className="underline" href='/privacy'>privacy page</a>{' '}
          or check the{' '}<a className="underline" href="https://github.com/juandjara/pressunto/blob/master/app/lib/github.ts">public source code</a>{' '}
        </p>
      </div>
      <footer className="-mx-2 mt-6 flex items-center gap-2 text-sm">
        <Link className="p-2 hover:underline" to='/docs'>Documentation</Link>
        <div className="h-6 border-r border-slate-300"></div>
        <Link className="p-2 hover:underline" to='/docs/privacy'>Privacy</Link>
      </footer>
    </div>
  )
}
