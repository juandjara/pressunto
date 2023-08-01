import type { User } from "@/lib/github"
import { Link, useFetcher, useLocation, useMatches } from "@remix-run/react"
import { Menu, Transition } from '@headlessui/react'
import { buttonCN, inputCN } from "@/lib/styles"
import DarkModeToggler from "./DarkModeToggler"

const HEADER_INNER_HEIGHT = 64
export const HEADER_HEIGHT = `${HEADER_INNER_HEIGHT + 10}px`

export default function Header({ user }: { user: User }) {
  const location = useLocation()

  if (location.pathname === '/') {
    return null
  }

  return (
    <nav className="flex items-center p-3">
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
    <div>
      <Menu as="div" className="z-20 relative flex-shrink-0 h-10">
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
              enterFrom="scale-y-50 opacity-0"
              enterTo="scale-y-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-y-100 opacity-100"
              leaveTo="scale-y-50 opacity-0">
              <Menu.Items
                static
                className="rounded-lg bg-black w-28 absolute top-full right-0 ring-1 ring-black ring-opacity-5">
                <div className="rounded-lg shadow-md bg-white dark:bg-white/30 p-1">
                  <Menu.Item>
                    <button className={`w-full ${buttonCN.normal} ${buttonCN.cancel}`}>Projects</button>
                  </Menu.Item>
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

function LogoutButton() {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'

  return (
    <fetcher.Form action="/oauth/logout" method="post">
      <button disabled={busy} className={`w-full ${buttonCN.normal} ${buttonCN.cancel}`}>
        {busy ? 'Logging out...' : 'Log out'}
      </button> 
    </fetcher.Form>
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
