import type { User } from "@/lib/github"
import { Link, useFetcher, useLocation, useMatches } from "@remix-run/react"
import { Menu, Transition } from '@headlessui/react'
import { buttonCN, inputCN } from "@/lib/styles"
import DarkModeToggler from "./DarkModeToggler"

export const HEADER_HEIGHT = '65px'

export default function Header({ user }: { user: User }) {
  const location = useLocation()

  if (location.pathname === '/') {
    return null
  }

  return (
    <nav className="flex items-center p-3 border-b border-gray-200 dark:border-gray-600">
      <div className="hidden md:flex items-end">
        <HeaderTitle />
      </div>
      <div className="flex-grow"></div>
      <DarkModeToggler />
      <UserMenu user={user} />
    </nav>
  )
}

export function HeaderTitle() {
  const matches = useMatches()
  const breadcrumbMatch = matches.find(m => m.handle?.breadcrumb)

  return (
    <>
      <Link to="/" className="ml-1 inline-block text-slate-500">
        <h1 className="font-medium text-2xl font-serif">
          🐷
        </h1>
      </Link>
      {breadcrumbMatch ? (
        <div className="ml-3">{breadcrumbMatch.handle?.breadcrumb(breadcrumbMatch.data)}</div>
      ) : null}
    </>
  )
}

function UserMenu({ user }: { user: User }) {
  if (!user) {
    return null
  }

  return (
    <div className="z-20 relative flex-shrink-0 h-10">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button title="Open user menu">
              <span className="sr-only">Open user menu</span>
              <img
                className="rounded-full"
                src={user.avatar}
                width={40}
                height={40}
                title={user.name}
                alt={`github avatar for ${user.name}`}
              />
            </Menu.Button>
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-x-50 opacity-0"
              enterTo="scale-x-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-x-100 opacity-100"
              leaveTo="scale-x-50 opacity-0">
              <Menu.Items
                static
                className="absolute mr-3 mb-2 bottom-full right-full ring-1 ring-black ring-opacity-5">
                <div className="rounded-md shadow-md bg-white">
                  <LogoutButton />
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

export function LoginButton() {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'

  return (
    <fetcher.Form action='/oauth/login' method='post' className="flex gap-3">
      <select name='scope' className={inputCN}>
        <option value='public_repo'>Public repos only</option>
        <option value='repo'>Public and Private repos</option>
      </select>
      <button disabled={busy} className={`flex-shrink-0 ${buttonCN.normal} ${buttonCN.slate}`}>
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
      <button disabled={busy} className={`disabled:opacity-50 whitespace-nowrap rounded-lg px-4 py-2 ${color}`}>
        {busy ? 'Logging out...' : 'Log out'}
      </button> 
    </fetcher.Form>
  )
}
