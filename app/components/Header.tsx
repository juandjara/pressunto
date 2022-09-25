import type { User } from "@/lib/github"
import { Link, useFetcher, useLocation } from "@remix-run/react"

export default function Header({ user }: { user: User }) {
  const location = useLocation()
  if (location.pathname === '/') {
    return null
  }

  return (
    <nav className="flex items-center p-3 border-b border-gray-200">
      <Link to="/" className="ml-1 inline-block text-slate-500">
        <h1 className="font-medium text-2xl font-serif">
          🐷{" "}<em>Press</em>unto
        </h1>
      </Link>
      <div className="flex-grow"></div>
      <UserMenu user={user} />
    </nav>
  )
}

function UserMenu({ user }: { user: User }) {
  const children = user ? (
    <>
      <LogoutButton />
      <img
        className="ml-1 rounded-full"
        src={user.avatar}
        width={40}
        height={40}
        title={user.name}
        alt={`github avatar for ${user.name}`}
      />
    </>
  ) : <LoginButton />

  return (
    // maintain 40px height to avoid CLS
    <div className="flex items-center h-10">{children}</div>
  )
}

export function LoginButton() {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'

  return (
    <fetcher.Form action='/oauth/login' method='post'>
      <button disabled={busy} className="disabled:opacity-50 flex rounded-lg text-white bg-slate-900 px-4 py-2">
        {busy ? 'Logging in...' : 'Log in'}
      </button>
    </fetcher.Form>
  )
}

export function LogoutButton({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' }) {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'
  const color = variant === 'secondary' ? 'text-slate-600 hover:bg-slate-100' : 'text-white bg-slate-900'

  return (
    <fetcher.Form action="/oauth/logout" method="post">
      <button disabled={busy} className={`disabled:opacity-50 flex rounded-lg px-4 py-2 ${color}`}>
        {busy ? 'Logging out...' : 'Logout'}
      </button> 
    </fetcher.Form>
  )
}
